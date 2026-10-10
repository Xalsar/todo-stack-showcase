const BE_PORT = process.env.E2E_BE_PORT ?? "4100"

export const API_URL = process.env.E2E_API_URL ?? `http://localhost:${BE_PORT}`
