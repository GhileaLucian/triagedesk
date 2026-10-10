import { z } from 'zod';

export const Category = z.enum([
  'billing',
  'bug',
  'feature_request',
  'account',
  'other',
]);
export type Category = z.infer<typeof Category>;

export const Priority = z.enum(['low', 'medium', 'high']);
export type Priority = z.infer<typeof Priority>;

export const TicketStatus = z.enum(['open', 'in_progress', 'resolved']);
export type TicketStatus = z.infer<typeof TicketStatus>;

export const TriageResult = z.object({
  category: Category,
  priority: Priority,
  summary: z.string().max(200),
  needs_review: z.boolean().optional(),
});
export type TriageResult = z.infer<typeof TriageResult>;

export const CreateTicket = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters long')
    .max(120, 'Title cannot exceed 120 characters'),
  body: z
    .string()
    .min(10, 'Body must be at least 10 characters long')
    .max(5000, 'Body cannot exceed 5000 characters'),
});
export type CreateTicket = z.infer<typeof CreateTicket>;

export const UpdateTicket = z.object({
  status: TicketStatus,
});
export type UpdateTicket = z.infer<typeof UpdateTicket>;

export interface TicketRecord {
  id: number;
  title: string;
  body: string;
  status: TicketStatus;
  category: Category | null;
  priority: Priority | null;
  summary: string | null;
  needs_review: number;
  created_at: string;
}
