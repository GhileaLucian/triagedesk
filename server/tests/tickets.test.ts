import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { createDatabase, TicketRepository, AppDatabase } from '../src/db.js';

describe('Ticket REST API Endpoints', () => {
  let db: AppDatabase;
  let repo: TicketRepository;
  let app: any;

  beforeEach(() => {
    db = createDatabase(':memory:');
    repo = new TicketRepository(db);
    const setup = createApp({ db, repo });
    app = setup.app;
  });

  it('1. POST /api/tickets should create and triage a valid ticket (201 Created)', async () => {
    const payload = {
      title: 'Payment refund request for double charge',
      body: 'I was billed twice for my subscription this month. Please issue a refund ASAP!',
    };

    const res = await request(app).post('/api/tickets').send(payload);

    expect(res.status).toBe(201);
    expect(res.body.id).toBe(1);
    expect(res.body.title).toBe(payload.title);
    expect(res.body.status).toBe('open');
    expect(res.body.category).toBe('billing');
    expect(res.body.priority).toBe('high');
    expect(res.body.summary).toBeDefined();
    expect(res.body.needs_review).toBe(0);
  });

  it('2. POST /api/tickets should reject title shorter than 3 characters with 400', async () => {
    const payload = {
      title: 'Hi',
      body: 'Valid body text with enough characters to pass validation',
    };

    const res = await request(app).post('/api/tickets').send(payload);

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
    expect(res.body.details.title).toBeDefined();
  });

  it('3. POST /api/tickets should reject body shorter than 10 characters with 400', async () => {
    const payload = {
      title: 'Valid Title Here',
      body: 'Too short',
    };

    const res = await request(app).post('/api/tickets').send(payload);

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
    expect(res.body.details.body).toBeDefined();
  });

  it('4. POST /api/tickets should reject missing fields with 400', async () => {
    const res = await request(app).post('/api/tickets').send({});

    expect(res.status).toBe(400);
    expect(res.body.details.title).toBeDefined();
    expect(res.body.details.body).toBeDefined();
  });

  it('5. GET /api/tickets should return an empty array when no tickets exist', async () => {
    const res = await request(app).get('/api/tickets');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });

  it('6. GET /api/tickets should list all created tickets in descending ID order', async () => {
    repo.create({ title: 'First Ticket', body: 'First ticket body content with details' });
    repo.create({ title: 'Second Ticket', body: 'Second ticket body content with details' });

    const res = await request(app).get('/api/tickets');

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(2);
    expect(res.body[0].id).toBe(2);
    expect(res.body[1].id).toBe(1);
  });

  it('7. GET /api/tickets should filter tickets by status', async () => {
    const t1 = repo.create({ title: 'Open Ticket', body: 'Detailed description for open ticket' });
    const t2 = repo.create({ title: 'In Progress Ticket', body: 'Detailed description for in progress ticket' });
    repo.update(t2.id, { status: 'in_progress' });

    const resOpen = await request(app).get('/api/tickets?status=open');
    expect(resOpen.body.length).toBe(1);
    expect(resOpen.body[0].id).toBe(t1.id);

    const resInProgress = await request(app).get('/api/tickets?status=in_progress');
    expect(resInProgress.body.length).toBe(1);
    expect(resInProgress.body[0].id).toBe(t2.id);
  });

  it('8. GET /api/tickets should filter tickets by priority and category', async () => {
    repo.create({
      title: 'High priority billing bug',
      body: 'Detailed description of billing error',
      category: 'billing',
      priority: 'high',
    });
    repo.create({
      title: 'Low priority feature request',
      body: 'Detailed description of suggestion',
      category: 'feature_request',
      priority: 'low',
    });

    const resBilling = await request(app).get('/api/tickets?category=billing&priority=high');
    expect(resBilling.body.length).toBe(1);
    expect(resBilling.body[0].category).toBe('billing');
    expect(resBilling.body[0].priority).toBe('high');
  });

  it('9. GET /api/tickets/:id should return a specific ticket by ID', async () => {
    const created = repo.create({
      title: 'Specific Ticket Title',
      body: 'Detailed body for specific lookup test',
    });

    const res = await request(app).get(`/api/tickets/${created.id}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(created.id);
    expect(res.body.title).toBe('Specific Ticket Title');
  });

  it('10. GET /api/tickets/:id should return 404 for non-existent ticket', async () => {
    const res = await request(app).get('/api/tickets/9999');

    expect(res.status).toBe(404);
    expect(res.body.error).toContain('not found');
  });

  it('11. PATCH /api/tickets/:id should update ticket status successfully', async () => {
    const ticket = repo.create({
      title: 'Status Transition Ticket',
      body: 'Will test transition from open to resolved',
    });

    const res = await request(app).patch(`/api/tickets/${ticket.id}`).send({ status: 'resolved' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('resolved');
  });

  it('12. PATCH /api/tickets/:id should reject invalid status string with 400', async () => {
    const ticket = repo.create({
      title: 'Invalid Status Test',
      body: 'Will attempt setting invalid enum status',
    });

    const res = await request(app).patch(`/api/tickets/${ticket.id}`).send({ status: 'archived_invalid' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
  });

  it('13. POST /api/tickets/:id/retriage should re-evaluate classification', async () => {
    const ticket = repo.create({
      title: 'System Crash Error 500 Outage',
      body: 'The server crashed with an unhandled exception and is completely down!',
      category: 'other',
      priority: 'low',
    });

    const res = await request(app).post(`/api/tickets/${ticket.id}/retriage`);

    expect(res.status).toBe(200);
    expect(res.body.category).toBe('bug');
    expect(res.body.priority).toBe('high');
  });

  it('14. GET /api/stats should return aggregate counts across tickets', async () => {
    repo.create({ title: 'T1', body: 'Content 1 for stats calculation', category: 'billing', priority: 'high', status: 'open' });
    repo.create({ title: 'T2', body: 'Content 2 for stats calculation', category: 'bug', priority: 'medium', status: 'in_progress' });
    repo.create({ title: 'T3', body: 'Content 3 for stats calculation', category: 'account', priority: 'low', status: 'resolved', needs_review: true });

    const res = await request(app).get('/api/stats');

    expect(res.status).toBe(200);
    expect(res.body.total).toBe(3);
    expect(res.body.byStatus.open).toBe(1);
    expect(res.body.byStatus.in_progress).toBe(1);
    expect(res.body.byStatus.resolved).toBe(1);
    expect(res.body.byPriority.high).toBe(1);
    expect(res.body.byCategory.billing).toBe(1);
    expect(res.body.needsReview).toBe(1);
  });
});
