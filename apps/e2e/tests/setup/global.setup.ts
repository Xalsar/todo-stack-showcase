import { execSync } from "node:child_process"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import { test as setup } from "@playwright/test"

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../../..")

setup("seed e2e database and auth state", () => {
  setup.setTimeout(180_000)
  execSync("pnpm e2e:setup", { cwd: repoRoot, stdio: "inherit" })
})
