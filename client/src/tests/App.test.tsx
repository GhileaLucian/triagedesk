import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import App from '../App';
import { api } from '../api';

vi.mock('../api', () => ({
  api: {
    getTickets: vi.fn(),
    getStats: vi.fn(),
    createTicket: vi.fn(),
    updateTicketStatus: vi.fn(),
    retriageTicket: vi.fn(),
  },
}));

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders application brand header and stats cards', async () => {
    (api.getTickets as any).mockResolvedValue([]);
    (api.getStats as any).mockResolvedValue({
      total: 10,
      byStatus: { open: 4, in_progress: 3, resolved: 3 },
      byPriority: { low: 2, medium: 5, high: 3 },
      byCategory: { billing: 3, bug: 3, feature_request: 2, account: 1, other: 1 },
      needsReview: 0,
    });

    render(<App />);

    expect(screen.getByText('TriageDesk')).toBeInTheDocument();
    expect(screen.getByText('New Ticket')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Total Volume')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText('Open Queue')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
    });
  });

  it('renders empty state message when ticket array is empty', async () => {
    (api.getTickets as any).mockResolvedValue([]);
    (api.getStats as any).mockResolvedValue(null);

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('No tickets found')).toBeInTheDocument();
    });
  });

  it('renders ticket table rows when data is loaded', async () => {
    (api.getTickets as any).mockResolvedValue([
      {
        id: 1,
        title: 'Payment double charge refund',
        body: 'Please refund our duplicated credit card transaction.',
        status: 'open',
        category: 'billing',
        priority: 'high',
        summary: '[Mock] BILLING: Payment double charge refund',
        needs_review: 0,
        created_at: new Date().toISOString(),
      },
    ]);
    (api.getStats as any).mockResolvedValue(null);

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Payment double charge refund')).toBeInTheDocument();
      expect(screen.getByText('billing')).toBeInTheDocument();
      expect(screen.getByText('high')).toBeInTheDocument();
      expect(screen.getByText('open')).toBeInTheDocument();
    });
  });
});
