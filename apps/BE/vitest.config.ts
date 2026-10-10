import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    name: "BE",
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
})
