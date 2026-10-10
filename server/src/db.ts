import Database from 'better-sqlite3';
import { config } from './config.js';
import { TicketRecord, TicketStatus, Category, Priority } from './schemas.js';

export function createDatabase(dbPath: string = config.DATABASE_PATH) {
  const db = new Database(dbPath);

  // Enable WAL mode for high concurrency unless in-memory
  if (dbPath !== ':memory:') {
    db.pragma('journal_mode = WAL');
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'open',
      category TEXT,
      priority TEXT,
      summary TEXT,
      needs_review INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
    CREATE INDEX IF NOT EXISTS idx_tickets_priority ON tickets(priority);
    CREATE INDEX IF NOT EXISTS idx_tickets_category ON tickets(category);
  `);

  return db;
}

export type AppDatabase = ReturnType<typeof createDatabase>;

export class TicketRepository {
  constructor(private db: AppDatabase) {}

  findAll(filters?: {
    status?: TicketStatus;
    priority?: Priority;
    category?: Category;
    search?: string;
  }): TicketRecord[] {
    const conditions: string[] = [];
    const params: (string | number)[] = [];

    if (filters?.status) {
      conditions.push('status = ?');
      params.push(filters.status);
    }

    if (filters?.priority) {
      conditions.push('priority = ?');
      params.push(filters.priority);
    }

    if (filters?.category) {
      conditions.push('category = ?');
      params.push(filters.category);
    }

    if (filters?.search && filters.search.trim()) {
      conditions.push('(title LIKE ? OR body LIKE ? OR summary LIKE ?)');
      const pattern = `%${filters.search.trim()}%`;
      params.push(pattern, pattern, pattern);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const query = `SELECT * FROM tickets ${whereClause} ORDER BY id DESC`;

    const stmt = this.db.prepare(query);
    return stmt.all(...params) as TicketRecord[];
  }

  findById(id: number): TicketRecord | null {
    const stmt = this.db.prepare('SELECT * FROM tickets WHERE id = ?');
    const row = stmt.get(id);
    return (row as TicketRecord) || null;
  }

  create(ticket: {
    title: string;
    body: string;
    status?: TicketStatus;
    category?: Category | null;
    priority?: Priority | null;
    summary?: string | null;
    needs_review?: boolean;
  }): TicketRecord {
    const stmt = this.db.prepare(`
      INSERT INTO tickets (title, body, status, category, priority, summary, needs_review)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const info = stmt.run(
      ticket.title,
      ticket.body,
      ticket.status || 'open',
      ticket.category || null,
      ticket.priority || null,
      ticket.summary || null,
      ticket.needs_review ? 1 : 0
    );

    return this.findById(Number(info.lastInsertRowid))!;
  }

  update(
    id: number,
    fields: {
      status?: TicketStatus;
      category?: Category | null;
      priority?: Priority | null;
      summary?: string | null;
      needs_review?: boolean;
    }
  ): TicketRecord | null {
    const updates: string[] = [];
    const params: (string | number | null)[] = [];

    if (fields.status !== undefined) {
      updates.push('status = ?');
      params.push(fields.status);
    }
    if (fields.category !== undefined) {
      updates.push('category = ?');
      params.push(fields.category);
    }
    if (fields.priority !== undefined) {
      updates.push('priority = ?');
      params.push(fields.priority);
    }
    if (fields.summary !== undefined) {
      updates.push('summary = ?');
      params.push(fields.summary);
    }
    if (fields.needs_review !== undefined) {
      updates.push('needs_review = ?');
      params.push(fields.needs_review ? 1 : 0);
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    params.push(id);
    const query = `UPDATE tickets SET ${updates.join(', ')} WHERE id = ?`;
    const stmt = this.db.prepare(query);
    const info = stmt.run(...params);

    if (info.changes === 0) {
      return null;
    }

    return this.findById(id);
  }

  getStats() {
    const totalStmt = this.db.prepare('SELECT COUNT(*) as count FROM tickets');
    const total = (totalStmt.get() as { count: number }).count;

    const statusStmt = this.db.prepare('SELECT status, COUNT(*) as count FROM tickets GROUP BY status');
    const statusRows = statusStmt.all() as { status: string; count: number }[];
    const byStatus = {
      open: 0,
      in_progress: 0,
      resolved: 0,
    };
    for (const row of statusRows) {
      if (row.status in byStatus) {
        byStatus[row.status as keyof typeof byStatus] = row.count;
      }
    }

    const priorityStmt = this.db.prepare('SELECT priority, COUNT(*) as count FROM tickets WHERE priority IS NOT NULL GROUP BY priority');
    const priorityRows = priorityStmt.all() as { priority: string; count: number }[];
    const byPriority = {
      low: 0,
      medium: 0,
      high: 0,
    };
    for (const row of priorityRows) {
      if (row.priority in byPriority) {
        byPriority[row.priority as keyof typeof byPriority] = row.count;
      }
    }

    const categoryStmt = this.db.prepare('SELECT category, COUNT(*) as count FROM tickets WHERE category IS NOT NULL GROUP BY category');
    const categoryRows = categoryStmt.all() as { category: string; count: number }[];
    const byCategory: Record<string, number> = {
      billing: 0,
      bug: 0,
      feature_request: 0,
      account: 0,
      other: 0,
    };
    for (const row of categoryRows) {
      if (row.category in byCategory) {
        byCategory[row.category] = row.count;
      }
    }

    const reviewStmt = this.db.prepare('SELECT COUNT(*) as count FROM tickets WHERE needs_review = 1');
    const needsReview = (reviewStmt.get() as { count: number }).count;

    return {
      total,
      byStatus,
      byPriority,
      byCategory,
      needsReview,
    };
  }
}
