import { Router, Request, Response, NextFunction } from 'express';
import { TicketRepository } from '../db.js';

export function createStatsRouter(repo: TicketRepository) {
  const router = Router();

  // GET /api/stats
  router.get('/', (_req: Request, res: Response, next: NextFunction) => {
    try {
      const stats = repo.getStats();
      res.json(stats);
    } catch (err) {
      next(err);
    }
  });

  return router;
}
