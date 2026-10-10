import { spawn } from "node:child_process"
import { fileURLToPath } from "node:url"

const repoRoot = fileURLToPath(new URL("../../../", import.meta.url))

const FE_PORT = process.env.E2E_FE_PORT ?? "3100"
const BE_PORT = process.env.E2E_BE_PORT ?? "4100"
const FE_URL = `http://localhost:${FE_PORT}`
const API_URL = `http://localhost:${BE_PORT}`
const DATABASE_URL =
  process.env.E2E_DATABASE_URL ??
  "postgresql://todos:devpass@localhost:5432/todos_e2e?schema=public"

const servers = [
  {
    args: ["--filter", "BE", "dev"],
    env: {
      ...process.env,
      DATABASE_URL,
      PORT: BE_PORT,
      CORS_ORIGIN: FE_URL,
      BETTER_AUTH_URL: API_URL,
    },
  },
  {
    args: ["--filter", "FE", "dev"],
    env: {
      ...process.env,
      PORT: FE_PORT,
      NEXT_DIST_DIR: ".next-e2e",
      NEXT_PUBLIC_API_BASE_URL: API_URL,
      NEXT_PUBLIC_BETTER_AUTH_URL: API_URL,
    },
  },
]

const children = servers.map(({ args, env }) =>
  spawn("pnpm", args, {
    cwd: repoRoot,
    stdio: "inherit",
    detached: true,
    env,
  })
)

let shuttingDown = false

function shutdown() {
  if (shuttingDown) return
  shuttingDown = true

  for (const child of children) {
    if (child.pid) {
      try {
        process.kill(-child.pid, "SIGTERM")
      } catch {
        // already gone
      }
    }
  }

  setTimeout(() => {
    for (const child of children) {
      if (child.pid) {
        try {
          process.kill(-child.pid, "SIGKILL")
        } catch {
          // already gone
        }
      }
    }
    process.exit(0)
  }, 3000).unref()
}

process.on("SIGTERM", shutdown)
process.on("SIGINT", shutdown)

for (const child of children) {
  child.on("exit", (code) => {
    if (!shuttingDown && code !== 0) {
      console.error(`e2e server exited with code ${code}`)
    }
  })
}
