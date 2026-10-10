import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const e2eDir = resolve(dirname(fileURLToPath(import.meta.url)), "..")

export type StorageStateName = "userA" | "userB"

export function storageState(name: StorageStateName): string {
  return resolve(e2eDir, ".auth", `${name}.json`)
}
