import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { createDatabase, TicketRepository, AppDatabase } from './db.js';
import { createTicketsRouter } from './routes/tickets.js';
import { createStatsRouter } from './routes/stats.js';

export interface CreateAppOptions {
  db?: AppDatabase;
  repo?: TicketRepository;
}

export function createApp(options?: CreateAppOptions) {
  const app = express();

  const db = options?.db || createDatabase();
  const repo = options?.repo || new TicketRepository(db);

  // Standard middleware
  app.use(cors());
  app.use(express.json());

  // Health check endpoint
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'triagedesk-api',
      timestamp: new Date().toISOString(),
    });
  });

  // API Routers
  app.use('/api/tickets', createTicketsRouter(repo));
  app.use('/api/stats', createStatsRouter(repo));

  // Centralized Error Handling Middleware
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error('[Unhandled Error]:', err);
    const status = err.status || err.statusCode || 500;
    res.status(status).json({
      error: err.message || 'Internal Server Error',
      details: err.details || undefined,
    });
  });

  return { app, db, repo };
}
