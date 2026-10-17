# Vercel Deployment Patterns & Gotchas

## Overview

Common issues and solutions when deploying to Vercel, especially for monorepos with separate frontend and backend services.

---

## 1. Express.js on Vercel: Default Export Required

### Problem
Vercel's Express auto-detection requires the app to be exported as the **default export**. Named exports will cause silent failures — the deployment succeeds but the app throws runtime errors.

**Error:**
```
FUNCTION_INVOCATION_FAILED
Invalid export found in module "/var/task/src/app.js". 
The default export must be a function or server.
```

### Solution
```typescript
// ❌ WRONG - Named export only
export const app = express()

// ✅ CORRECT - Both named and default export
export const app = express()
// ... setup routes ...
export default app
```

### Why This Happens
Vercel's Express framework detection looks for a default export that is a function or Express app instance. Named exports are ignored.

### Checklist
- [ ] Ensure `export default app` is present in your main Express file
- [ ] Test the deployment immediately after first deploy to catch this early
- [ ] Add a `/health` endpoint to verify the app is running

---

## 2. Redundant Environment Variables for Same Backend

### Problem
When both your API client and auth client need the backend URL, it's tempting to create separate env vars:
- `NEXT_PUBLIC_API_BASE_URL` for REST API calls
- `NEXT_PUBLIC_BETTER_AUTH_URL` for auth client

If only one gets set during deployment, the other falls back to localhost → CORS errors.

### Solution
**Use a single source of truth:**
```typescript
// fetcher.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000"

// auth-client.ts - REUSE the same env var
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000",
})
```

### Why This Matters
- Fewer env vars to configure and maintain
- Eliminates inconsistency bugs
- Clearer intent: both modules talk to the same backend

### Audit Checklist Before Deploying
```bash
# Find all NEXT_PUBLIC_ env vars
grep -r "NEXT_PUBLIC_" src/ --include="*.ts" --include="*.tsx"

# Check for duplicates pointing to same URL
# If multiple vars point to the same backend, consolidate them
```

---

## 3. Monorepo Test Config Leaking into App Builds

### Problem
In a monorepo with pnpm workspaces, test files in `apps/FE` may import from packages that are only in the root `package.json`, not in `apps/FE/package.json`. When Next.js runs TypeScript checks during build, it picks up these test files and fails.

**Error:**
```
Type error: Cannot find module 'vitest/config' or its corresponding type declarations.
```

### Solution
Exclude test files from the app's TypeScript configuration:

```json
// apps/FE/tsconfig.json
{
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts"
  ],
  "exclude": [
    "node_modules",
    "vitest.config.ts",
    "vitest.setup.ts",
    "**/*.test.ts",
    "**/*.test.tsx"
  ]
}
```

### Why This Happens
- Monorepo test configs often import from root-level dependencies
- Next.js build runs `tsc --noEmit` which checks all included files
- If test files are included, they fail because the deps aren't in the app's package.json

### Prevention
- Always exclude test files from app tsconfig.json in monorepos
- Keep test configs in a separate directory or use a root-level vitest config
- Verify builds work locally before deploying

---

## 4. Vercel MCP vs CLI: Permission Issues

### Problem
Vercel MCP tools may return 403/404 errors when creating projects, even with proper authentication. This is often due to scope/team permission mismatches between MCP and CLI.

**Error:**
```
Vercel API request failed (403: forbidden). You don't have permission to create the project.
```

### Solution
**Use Vercel CLI as fallback:**
```bash
# Create project via CLI
cd apps/BE
vercel --yes --name todo-stack-be

# Set environment variables
echo "value" | vercel env add VAR_NAME production
echo "value" | vercel env add VAR_NAME preview
echo "value" | vercel env add VAR_NAME development

# Deploy
vercel --yes --prod
```

### When to Use CLI vs MCP
- **MCP**: Good for querying project info, checking deployments, reading logs
- **CLI**: More reliable for creating projects, setting env vars, deploying
- **Fallback strategy**: Try MCP first, fall back to CLI if it fails

### Best Practices
- Always have Vercel CLI installed and authenticated as backup
- Use `--yes` flag to skip interactive prompts in CI/automation
- Use `--prod` for production deployments

---

## 5. Cross-Subdomain Cookies for Split Deployments

### Problem
When frontend and backend are on different subdomains (e.g., `app.example.com` and `api.example.com`), session cookies won't be shared by default.

### Solution
Configure your auth library to use cross-subdomain cookies:

**For better-auth:**
```typescript
export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  advanced: {
    crossSubDomainCookies: {
      enabled: true,
      domain: "example.com", // root domain
    },
  },
})
```

### Cookie Domain Rules
- Cookies set on `api.example.com` are NOT accessible from `app.example.com`
- Cookies set on `.example.com` (note the dot) ARE accessible from all subdomains
- Cross-subdomain cookies require the root domain to be specified

### Checklist
- [ ] Enable cross-subdomain cookies in auth config
- [ ] Set the root domain (not a subdomain)
- [ ] Test login flow across subdomains
- [ ] Verify cookies are shared in browser dev tools

---

## 6. Build Script Considerations

### Problem
Production builds may fail if dependencies aren't generated or compiled in the right order.

### Solution
Chain build steps in the correct order:

```json
// apps/BE/package.json
{
  "scripts": {
    "build": "prisma generate && tsc -p tsconfig.json",
    "start": "node dist/server.js"
  }
}
```

### Common Build Chains
**Express + Prisma:**
```bash
prisma generate && tsc
```

**Next.js + Prisma:**
```bash
prisma generate && next build
```

**Monorepo with workspaces:**
```bash
# From root
pnpm install
pnpm --filter BE build
pnpm --filter FE build
```

### Checklist
- [ ] Generate Prisma client before TypeScript compilation
- [ ] Use compiled JS for production (`node dist/server.js`), not tsx
- [ ] Test build locally before deploying

---

## 7. Google OAuth: Production Redirect URIs

### Problem
Google OAuth works locally but fails in production with `redirect_uri_mismatch`.

### Solution
Update Google Cloud Console with production URLs:

**Authorized JavaScript origins:**
```
https://app.example.com
```

**Authorized redirect URIs:**
```
https://api.example.com/api/auth/callback/google
```

### Steps
1. Go to https://console.cloud.google.com/apis/credentials
2. Edit your OAuth 2.0 Client ID
3. Add production URLs (keep localhost URLs for development)
4. Save and wait 2-5 minutes for propagation
5. Test the login flow

### Common Mistakes
- Forgetting to add the redirect URI (not just the origin)
- Using wrong callback path (check your auth library's default)
- Not waiting for Google to propagate the changes

---

## 8. Environment Variable Strategy

### Problem
Confusion about which env vars should be set where (local, Vercel, etc.)

### Solution
**Clear naming convention:**
- `NEXT_PUBLIC_*` — Exposed to browser (baked at build time)
- No prefix — Server-only (available at runtime)

**Deployment checklist:**
```bash
# Backend env vars (set in Vercel)
DATABASE_URL              # Database connection string
BETTER_AUTH_SECRET        # Session signing secret
BETTER_AUTH_URL           # Backend URL (e.g., https://api.example.com)
CORS_ORIGIN               # Frontend URL (e.g., https://app.example.com)
GOOGLE_CLIENT_ID          # OAuth client ID
GOOGLE_CLIENT_SECRET      # OAuth client secret

# Frontend env vars (set in Vercel)
NEXT_PUBLIC_API_BASE_URL  # Backend URL (baked into client bundle)
```

### Best Practices
- Use `encrypted` type for secrets in Vercel
- Set env vars for all environments: production, preview, development
- Document required env vars in README or deployment guide
- Never commit `.env` files with production secrets

---

## 9. Health Check Endpoint

### Problem
Can't verify if the backend is actually running after deployment.

### Solution
Add a simple health check endpoint:

```typescript
// apps/BE/src/app.ts
app.get("/health", (_req, res) => {
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version 
  })
})
```

### Testing
```bash
curl https://api.example.com/health
# Expected: {"status":"ok","timestamp":"2026-10-17T15:51:52.372Z"}
```

### Why This Matters
- Quick way to verify deployment succeeded
- Can be used by monitoring tools
- Helps debug routing issues

---

## 10. Deployment Workflow

### Recommended Order
1. **Set up database** (Neon, PlanetScale, etc.)
2. **Prepare backend**
   - Add health check endpoint
   - Add `export default app` (Express)
   - Update build scripts
3. **Deploy backend to Vercel**
   - Create project
   - Set environment variables
   - Deploy and verify health check
4. **Prepare frontend**
   - Exclude test files from tsconfig
   - Consolidate env vars
   - Update API base URL config
5. **Deploy frontend to Vercel**
   - Create project
   - Set NEXT_PUBLIC_API_BASE_URL
   - Deploy and verify
6. **Configure custom domains**
   - Add domains to both projects
   - Update env vars with custom URLs
   - Redeploy both apps
7. **Configure OAuth**
   - Add production URLs to Google Cloud Console
   - Test login flow
8. **Test end-to-end**
   - Login flow
   - CRUD operations
   - Cross-subdomain cookies

### Rollback Plan
- Vercel keeps deployment history — can rollback to previous deployment
- Database snapshots (Neon free tier includes 1 snapshot)
- Keep `.env` files backed up locally

---

## Quick Reference: Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `FUNCTION_INVOCATION_FAILED` | Missing default export | Add `export default app` |
| `CORS error` | Wrong API URL or CORS_ORIGIN | Check env vars match production URLs |
| `Cannot find module 'vitest/config'` | Test files in build | Exclude test files from tsconfig.json |
| `redirect_uri_mismatch` | Google OAuth not configured | Add production URLs to Google Cloud Console |
| `403: forbidden` (Vercel MCP) | Permission issues | Use Vercel CLI as fallback |
| `Session cookie not set` | Cross-subdomain issue | Enable crossSubDomainCookies in auth config |

---

## Additional Resources

- [Vercel Express Documentation](https://vercel.com/docs/frameworks/express)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Vercel CLI Commands](https://vercel.com/docs/cli)
- [better-auth Documentation](https://www.better-auth.com/docs)
- [Neon Documentation](https://neon.tech/docs)

---

## Version History

- **2026-10-17**: Initial version based on todo-stack-showcase deployment
  - Express + Next.js + Vercel + Neon stack
  - pnpm monorepo with workspaces
  - better-auth for authentication
  - Google OAuth integration
