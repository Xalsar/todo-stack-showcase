---
name: format-before-commit
description: Format code before committing or pushing. Use when asked to commit, stage, push, or save progress to git, and whenever preparing changes for a pull request.
---

# Format before commit/push

Never commit, stage, or push working-tree changes without first running the
repo's formatter. The formatter is Prettier, configured repo-wide.

## Always run first

```bash
pnpm format
```

`pnpm format` runs `prettier --write .` across the whole repo (see
`package.json`). Formatting only touches whitespace/style; it must run before
`git add`.

## Then verify

Run the repo's verification commands for the changed apps before pushing.
See `AGENTS.md` for the current commands (BE: `pnpm be:build`; FE:
`pnpm --filter FE typecheck` and `pnpm --filter FE lint`). Do not commit
changes that fail these checks.

## Workflow

1. Make code changes.
2. `pnpm format`.
3. Run typecheck/lint/build for the affected app(s).
4. Only then `git add`, `git commit`, and `git push`.

Generated files (e.g. `apps/FE/src/lib/api/generated/**`, `apps/BE/openapi.json`)
are already formatted/ignored and should not be hand-edited; if you did not
change them, formatting leaves them untouched.
