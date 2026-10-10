import { Router, Request, Response, NextFunction } from 'express';
import { TicketRepository } from '../db.js';
import { CreateTicket, UpdateTicket, TicketStatus, Priority, Category } from '../schemas.js';
import { triageWithFallback } from '../triage/index.js';

export function createTicketsRouter(repo: TicketRepository) {
  const router = Router();

  // GET /api/tickets
  router.get('/', (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status, priority, category, search } = req.query;

      const filters: {
        status?: TicketStatus;
        priority?: Priority;
        category?: Category;
        search?: string;
      } = {};

      if (status && typeof status === 'string') {
        const parsedStatus = TicketStatus.safeParse(status);
        if (parsedStatus.success) filters.status = parsedStatus.data;
      }

      if (priority && typeof priority === 'string') {
        const parsedPriority = Priority.safeParse(priority);
        if (parsedPriority.success) filters.priority = parsedPriority.data;
      }

      if (category && typeof category === 'string') {
        const parsedCategory = Category.safeParse(category);
        if (parsedCategory.success) filters.category = parsedCategory.data;
      }

      if (search && typeof search === 'string') {
        filters.search = search;
      }

      const tickets = repo.findAll(filters);
      res.json(tickets);
    } catch (err) {
      next(err);
    }
  });

  // GET /api/tickets/:id
  router.get('/:id', (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid ticket ID' });
        return;
      }

      const ticket = repo.findById(id);
      if (!ticket) {
        res.status(404).json({ error: `Ticket #${id} not found` });
        return;
      }

      res.json(ticket);
    } catch (err) {
      next(err);
    }
  });

  // POST /api/tickets
  router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validation = CreateTicket.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({
          error: 'Validation failed',
          details: validation.error.flatten().fieldErrors,
        });
        return;
      }

      const { title, body } = validation.data;

      // Run AI/Mock triage with safe fallback
      const triage = await triageWithFallback({ title, body });

      const newTicket = repo.create({
        title,
        body,
        status: 'open',
        category: triage.category,
        priority: triage.priority,
        summary: triage.summary,
        needs_review: triage.needs_review || false,
      });

      res.status(201).json(newTicket);
    } catch (err) {
      next(err);
    }
  });

  // PATCH /api/tickets/:id
  router.patch('/:id', (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid ticket ID' });
        return;
      }

      const validation = UpdateTicket.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({
          error: 'Validation failed',
          details: validation.error.flatten().fieldErrors,
        });
        return;
      }

      const updated = repo.update(id, {
        status: validation.data.status,
      });

      if (!updated) {
        res.status(404).json({ error: `Ticket #${id} not found` });
        return;
      }

      res.json(updated);
    } catch (err) {
      next(err);
    }
  });

  // POST /api/tickets/:id/retriage
  router.post('/:id/retriage', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid ticket ID' });
        return;
      }

      const existing = repo.findById(id);
      if (!existing) {
        res.status(404).json({ error: `Ticket #${id} not found` });
        return;
      }

      const triage = await triageWithFallback({
        title: existing.title,
        body: existing.body,
      });

      const updated = repo.update(id, {
        category: triage.category,
        priority: triage.priority,
        summary: triage.summary,
        needs_review: triage.needs_review || false,
      });

      res.json(updated);
    } catch (err) {
      next(err);
    }
  });

  return router;
}
