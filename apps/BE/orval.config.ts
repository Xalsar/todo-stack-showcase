import { defineConfig } from "orval"

export default defineConfig({
  "todo-api": {
    input: "./openapi.json",
    output: {
      target: "../FE/src/lib/api/generated/client.ts",
      schemas: "../FE/src/lib/api/generated/model",
      // FE resolves modules with `bundler`, which cannot resolve NodeNext-style
      // `.js` import specifiers — pointing orval at the FE tsconfig makes it
      // emit extensionless relative imports.
      tsconfig: "../FE/tsconfig.json",
      client: "swr",
      httpClient: "fetch",
      clean: true,
      override: {
        fetch: {
          includeHttpResponseReturnType: false,
        },
        mutator: {
          path: "../FE/src/lib/api/fetcher.ts",
          name: "todoFetch",
        },
      },
    },
  },
})
