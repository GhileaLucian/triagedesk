import { Ticket, Stats, CreateTicketInput, TicketStatus } from './types';

const BASE_URL = '/api';

export class ApiError extends Error {
  constructor(public status: number, message: string, public details?: any) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    let errBody: any = {};
    try {
      errBody = await response.json();
    } catch {
      errBody = { error: response.statusText };
    }
    throw new ApiError(response.status, errBody.error || 'Request failed', errBody.details);
  }

  return response.json();
}

export const api = {
  getTickets: (filters?: {
    status?: string;
    priority?: string;
    category?: string;
    search?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.search) params.append('search', filters.search);

    const qs = params.toString() ? `?${params.toString()}` : '';
    return request<Ticket[]>(`/tickets${qs}`);
  },

  getTicketById: (id: number) => {
    return request<Ticket>(`/tickets/${id}`);
  },

  createTicket: (data: CreateTicketInput) => {
    return request<Ticket>('/tickets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateTicketStatus: (id: number, status: TicketStatus) => {
    return request<Ticket>(`/tickets/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  retriageTicket: (id: number) => {
    return request<Ticket>(`/tickets/${id}/retriage`, {
      method: 'POST',
    });
  },

  getStats: () => {
    return request<Stats>('/stats');
  },
};
