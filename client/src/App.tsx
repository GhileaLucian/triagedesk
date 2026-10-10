import { useState, useEffect, useCallback } from 'react';
import { Ticket, Stats, CreateTicketInput, TicketStatus } from './types';
import { api } from './api';
import { Header } from './components/Header';
import { StatsSummary } from './components/StatsSummary';
import { TicketTable } from './components/TicketTable';
import { TicketForm } from './components/TicketForm';
import { TicketDetail } from './components/TicketDetail';

export function App() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Filters & Search
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [fetchedTickets, fetchedStats] = await Promise.all([
        api.getTickets({
          status: statusFilter || undefined,
          priority: priorityFilter || undefined,
          category: categoryFilter || undefined,
          search: searchQuery || undefined,
        }),
        api.getStats(),
      ]);
      setTickets(fetchedTickets);
      setStats(fetchedStats);
    } catch (err) {
      console.error('Failed to load tickets/stats:', err);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, priorityFilter, categoryFilter, searchQuery]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateTicket = async (data: CreateTicketInput) => {
    setIsSubmitting(true);
    try {
      await api.createTicket(data);
      await loadData();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (id: number, status: TicketStatus) => {
    setIsUpdating(true);
    try {
      const updated = await api.updateTicketStatus(id, status);
      setSelectedTicket(updated);
      await loadData();
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRetriage = async (id: number) => {
    setIsUpdating(true);
    try {
      const updated = await api.retriageTicket(id);
      setSelectedTicket(updated);
      await loadData();
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="app-container">
      <Header
        onNewTicket={() => setIsFormOpen(true)}
        onRefresh={loadData}
        isLoading={isLoading}
      />

      <StatsSummary stats={stats} />

      <main>
        <TicketTable
          tickets={tickets}
          isLoading={isLoading}
          onSelectTicket={(ticket) => setSelectedTicket(ticket)}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          priorityFilter={priorityFilter}
          onPriorityFilterChange={setPriorityFilter}
          categoryFilter={categoryFilter}
          onCategoryFilterChange={setCategoryFilter}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
        />
      </main>

      <TicketForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleCreateTicket}
        isSubmitting={isSubmitting}
      />

      <TicketDetail
        ticket={selectedTicket}
        onClose={() => setSelectedTicket(null)}
        onStatusChange={handleStatusChange}
        onRetriage={handleRetriage}
        isUpdating={isUpdating}
      />
    </div>
  );
}

export default App;
