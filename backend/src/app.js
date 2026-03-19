import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import router from './routes/index.js';
import { errorHandler } from './errors/errorHandler.js';
import { getDatabaseState } from './config/db.js';

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (_req, res) => {
  const dbState = getDatabaseState();
  res.json({ ok: true, dbConnected: dbState === 1, dbState });
});

app.use('/api/v1', router);

// Readiness probe: only 200 when DB is connected
app.get('/ready', (_req, res) => {
  const dbState = getDatabaseState();
  if (dbState === 1) return res.status(200).json({ ready: true });
  return res.status(503).json({ ready: false, dbConnected: false });
});

// 404 for unknown routes
app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found',
    method: req.method,
    path: req.originalUrl,
  });
});


app.use(errorHandler);

export default app;


