import { defineConfig } from 'orval';

export default defineConfig({
  'todo-api': {
    input: './openapi.json',
    output: {
      target: '../FE/src/lib/api/generated/client.ts',
      schemas: '../FE/src/lib/api/generated/model',
      client: 'swr',
      httpClient: 'fetch',
      clean: true,
      override: {
        fetch: {
          includeHttpResponseReturnType: false,
        },
        mutator: {
          path: '../FE/src/lib/api/fetcher.ts',
          name: 'todoFetch',
        },
      },
    },
  },
});
