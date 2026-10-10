export type Category = 'billing' | 'bug' | 'feature_request' | 'account' | 'other';
export type Priority = 'low' | 'medium' | 'high';
export type TicketStatus = 'open' | 'in_progress' | 'resolved';

export interface Ticket {
  id: number;
  title: string;
  body: string;
  status: TicketStatus;
  category: Category | null;
  priority: Priority | null;
  summary: string | null;
  needs_review: number; // 0 or 1 from SQLite
  created_at: string;
}

export interface Stats {
  total: number;
  byStatus: {
    open: number;
    in_progress: number;
    resolved: number;
  };
  byPriority: {
    low: number;
    medium: number;
    high: number;
  };
  byCategory: {
    billing: number;
    bug: number;
    feature_request: number;
    account: number;
    other: number;
  };
  needsReview: number;
}

export interface CreateTicketInput {
  title: string;
  body: string;
}
