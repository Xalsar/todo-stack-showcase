import { writeFile } from 'node:fs/promises';

import { OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';

import '../routes/todos.js';
import { registry } from '../schemas/todo.js';

const generator = new OpenApiGeneratorV3(registry.definitions);

const document = generator.generateDocument({
  openapi: '3.0.0',
  info: {
    title: 'Todo API',
    version: '0.1.0',
  },
});

await writeFile(
  new URL('../../openapi.json', import.meta.url),
  `${JSON.stringify(document, null, 2)}\n`,
);
