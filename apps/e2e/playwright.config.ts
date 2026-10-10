import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import { defineConfig, devices } from "@playwright/test"

import { storageState } from "./tests/storage"

const configDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(configDir, "../..")

const FE_PORT = process.env.E2E_FE_PORT ?? "3100"
const BE_PORT = process.env.E2E_BE_PORT ?? "4100"
const FE_URL = process.env.E2E_FE_URL ?? `http://localhost:${FE_PORT}`

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [["github"], ["list"]] : [["list"]],
  use: {
    baseURL: FE_URL,
    trace: "on-first-retry",
    ...devices["Desktop Chrome"],
  },
  projects: [
    {
      name: "setup",
      testDir: "./tests/setup",
      testMatch: /global\.setup\.ts/,
    },
    {
      name: "userA",
      testDir: "./tests/userA",
      dependencies: ["setup"],
      use: { storageState: storageState("userA") },
    },
    {
      name: "userB",
      testDir: "./tests/userB",
      dependencies: ["setup"],
      use: { storageState: storageState("userB") },
    },
    {
      name: "isolation",
      testDir: "./tests/isolation",
      dependencies: ["setup"],
    },
    {
      name: "anon",
      testDir: "./tests/anon",
    },
  ],
  webServer: {
    command: "node apps/e2e/scripts/dev-servers.mjs",
    cwd: repoRoot,
    url: FE_URL,
    reuseExistingServer: false,
    timeout: 120_000,
    gracefulShutdown: { signal: "SIGTERM", timeout: 10_000 },
  },
})
