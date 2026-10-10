import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    projects: ["apps/BE", "apps/FE"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: [
        "apps/BE/src/app.ts",
        "apps/BE/src/middleware/**/*.ts",
        "apps/BE/src/routes/**/*.ts",
        "apps/BE/src/schemas/**/*.ts",
        "apps/BE/src/services/**/*.ts",
        "apps/FE/containers/**/*.{ts,tsx}",
        "apps/FE/lib/**/*.ts",
        "apps/FE/providers/**/*.{ts,tsx}",
        "apps/FE/src/lib/api/fetcher.ts",
      ],
      exclude: [
        "**/*.test.{ts,tsx}",
        "apps/BE/src/lib/**",
        "apps/BE/src/scripts/**",
        "apps/BE/src/server.ts",
        "apps/FE/app/**",
        "apps/FE/components/**",
        "apps/FE/src/lib/api/generated/**",
        "apps/FE/src/lib/auth-client.ts",
      ],
      thresholds: {
        statements: 95,
        branches: 90,
        functions: 95,
        lines: 95,
      },
    },
  },
})
