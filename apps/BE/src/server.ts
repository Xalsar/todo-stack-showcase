import express from 'express';

import { todosRouter } from './routes/todos.js';

const app = express();

app.use(express.json());
app.use('/todos', todosRouter);

const port = Number(process.env.PORT ?? 3000);

app.listen(port, () => {
  console.log(`BE listening on http://localhost:${port}`);
});
