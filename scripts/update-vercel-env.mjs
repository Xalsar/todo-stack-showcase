#!/usr/bin/env node
/**
 * Update Vercel environment variables for all environments.
 *
 * Usage:
 *   1. Fill in the values in the ADD section below.
 *   2. Run:  node scripts/update-vercel-env.mjs
 *
 * Prerequisites: `vercel` CLI installed and you're logged in (`vercel login`).
 * The script will check both before doing anything.
 */

import { spawnSync } from "node:child_process"

// ─── Configuration ────────────────────────────────────────────────────────────

// Directory containing the Vercel project (relative to this script's parent).
// Must contain a package.json and be the root of the Vercel-deployed app.
const PROJECT_DIR = "apps/BE"

const ADD = {
  GOOGLE_CLIENT_ID: "",
  GOOGLE_CLIENT_SECRET: "",
  COOKIE_DOMAIN: "",
}

// ──────────────────────────────────────────────────────────────────────────────

import { existsSync } from "node:fs"
import { resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, "..")
const CWD = resolve(ROOT, PROJECT_DIR)

const ENVIRONMENTS = ["production", "preview", "development"]

// --- Preflight checks -------------------------------------------------------

function check(cmd, args, cwd) {
  const r = spawnSync(cmd, args, { stdio: "ignore", cwd })
  return r.status === 0
}

console.log("⏳  Checking prerequisites…\n")

if (!check("which", ["vercel"])) {
  console.error("❌  Vercel CLI not found. Install it:  npm i -g vercel")
  process.exit(1)
}

if (!check("vercel", ["whoami"])) {
  console.error("❌  Not logged in. Run:  vercel login")
  process.exit(1)
}

if (!existsSync(resolve(CWD, "package.json"))) {
  console.error(`❌  Project directory not found: ${PROJECT_DIR}`)
  process.exit(1)
}

// Auto-link the project if not already linked
if (!existsSync(resolve(CWD, ".vercel/project.json"))) {
  console.log(`🔗  Linking ${PROJECT_DIR} to a Vercel project…`)
  const linkResult = spawnSync("vercel", ["link", "--yes"], {
    cwd: CWD,
    stdio: "inherit",
  })
  if (linkResult.status !== 0) {
    console.error("❌  vercel link failed. Run it manually:")
    console.error(`    cd ${PROJECT_DIR} && vercel link`)
    process.exit(1)
  }
  console.log("")
}

console.log("✅  Vercel CLI is ready.\n")

// --- Helpers ----------------------------------------------------------------

function runVercel(args, input) {
  const r = spawnSync("vercel", args, {
    input,
    stdio: ["pipe", "inherit", "inherit"],
    encoding: "utf-8",
    cwd: CWD,
  })
  if (r.status !== 0) {
    throw new Error(`vercel ${args.join(" ")} exited with code ${r.status}`)
  }
}

// --- Remove existing vars (so add never prompts for overwrite) ---------------

for (const [name, value] of Object.entries(ADD)) {
  if (!value) continue // skip blanks
  for (const env of ENVIRONMENTS) {
    // Remove first — ignore errors if the var doesn't exist yet
    spawnSync("vercel", ["env", "rm", name, env, "--yes"], {
      stdio: "ignore",
      cwd: CWD,
    })
  }
}

// --- Add vars ---------------------------------------------------------------

let added = 0
let skipped = 0

for (const [name, value] of Object.entries(ADD)) {
  if (!value) {
    skipped++
    continue
  }
  for (const env of ENVIRONMENTS) {
    process.stdout.write(`📝  Setting ${name} on ${env}… `)
    try {
      runVercel(["env", "add", name, env], `${value}\n`)
      console.log("done")
      added++
    } catch {
      console.log("FAILED")
    }
  }
}

// --- Summary ----------------------------------------------------------------

console.log("")
if (skipped) {
  console.log(`⚠️   ${skipped} variable(s) had empty values and were skipped.`)
}
console.log(
  `✅  ${added} variable(s) set across ${ENVIRONMENTS.length} environment(s).`
)
console.log("\n🔄  Redeploy to apply:  vercel --prod")
