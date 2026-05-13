import express from 'express';
import { authRouter } from './routes/auth.js';
import { clientsRouter } from './routes/clients.js';
import { pipelineRouter } from './routes/pipeline.js';
import { serpRouter } from './routes/serp.js';

export function createApp() {
  const app = express();

  app.use(express.json());

  app.get('/health', (_req, res) => {
    return res.status(200).json({ ok: true });
  });

  app.use('/auth', authRouter);
  app.use('/clients', clientsRouter);
  app.use('/pipeline', pipelineRouter);
  app.use('/serp', serpRouter);

  app.use((_req, res) => {
    return res.status(404).json({ error: 'not_found' });
  });

  return app;
}
