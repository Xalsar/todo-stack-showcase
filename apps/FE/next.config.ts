import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  // Test files are excluded from the build; tsconfig.json includes them for
  // the editor and `pnpm --filter FE typecheck`.
  typescript: { tsconfigPath: "tsconfig.build.json" },
}

export default nextConfig
