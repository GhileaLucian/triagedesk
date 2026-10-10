import React from 'react';
import { Ticket, TicketStatus, Priority, Category } from '../types';
import { Search, AlertCircle, Sparkles } from 'lucide-react';

interface TicketTableProps {
  tickets: Ticket[];
  isLoading: boolean;
  onSelectTicket: (ticket: Ticket) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  priorityFilter: string;
  onPriorityFilterChange: (priority: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (category: string) => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
}

export const TicketTable: React.FC<TicketTableProps> = ({
  tickets,
  isLoading,
  onSelectTicket,
  statusFilter,
  onStatusFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  searchQuery,
  onSearchQueryChange,
}) => {
  const renderCategoryBadge = (cat: Category | null) => {
    if (!cat) return <span style={{ color: '#64748b' }}>-</span>;
    return (
      <span className="badge" style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: '#cbd5e1' }}>
        {cat.replace('_', ' ')}
      </span>
    );
  };

  const renderPriorityBadge = (p: Priority | null) => {
    if (!p) return <span style={{ color: '#64748b' }}>-</span>;
    return <span className={`badge badge-${p}`}>{p}</span>;
  };

  const renderStatusBadge = (s: TicketStatus) => {
    return <span className={`badge badge-${s}`}>{s.replace('_', ' ')}</span>;
  };

  return (
    <div>
      {/* Controls Bar */}
      <div className="controls-bar">
        <div className="search-input-wrapper">
          <Search size={16} className="search-icon" />
          <input
            className="search-input"
            placeholder="Search tickets by title, body, or AI summary..."
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>

          <select
            className="filter-select"
            value={priorityFilter}
            onChange={(e) => onPriorityFilterChange(e.target.value)}
          >
            <option value="">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            className="filter-select"
            value={categoryFilter}
            onChange={(e) => onCategoryFilterChange(e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="billing">Billing</option>
            <option value="bug">Bug</option>
            <option value="feature_request">Feature Request</option>
            <option value="account">Account</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="table-container">
        {isLoading ? (
          <div className="state-container">
            <div className="spinner" />
            <p>Fetching support tickets...</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="state-container">
            <AlertCircle size={32} style={{ margin: '0 auto 12px', color: '#64748b' }} />
            <p style={{ fontWeight: 600, color: '#f8fafc', marginBottom: 4 }}>No tickets found</p>
            <p style={{ fontSize: '0.85rem' }}>
              No support requests match your current search or filter criteria.
            </p>
          </div>
        ) : (
          <table className="ticket-table">
            <thead>
              <tr>
                <th style={{ width: 60 }}>ID</th>
                <th>Subject & AI Summary</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Review</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => (
                <tr
                  key={ticket.id}
                  className="ticket-row"
                  onClick={() => onSelectTicket(ticket)}
                >
                  <td style={{ fontFamily: 'var(--font-mono)', color: '#64748b' }}>
                    #{ticket.id}
                  </td>
                  <td className="ticket-title-cell">
                    <div className="ticket-title-text">{ticket.title}</div>
                    <div className="ticket-summary-text">
                      <Sparkles size={12} style={{ display: 'inline', marginRight: 4, color: '#818cf8' }} />
                      {ticket.summary || 'Awaiting triage summary...'}
                    </div>
                  </td>
                  <td>{renderCategoryBadge(ticket.category)}</td>
                  <td>{renderPriorityBadge(ticket.priority)}</td>
                  <td>{renderStatusBadge(ticket.status)}</td>
                  <td>
                    {ticket.needs_review === 1 ? (
                      <span className="badge badge-review">Needs Review</span>
                    ) : (
                      <span style={{ color: '#475569', fontSize: '0.8rem' }}>Verified</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
