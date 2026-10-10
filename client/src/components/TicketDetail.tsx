import React, { useState } from 'react';
import { Ticket, TicketStatus } from '../types';
import { X, Sparkles, RefreshCw, AlertTriangle, Calendar, Check } from 'lucide-react';

interface TicketDetailProps {
  ticket: Ticket | null;
  onClose: () => void;
  onStatusChange: (id: number, status: TicketStatus) => Promise<void>;
  onRetriage: (id: number) => Promise<void>;
  isUpdating: boolean;
}

export const TicketDetail: React.FC<TicketDetailProps> = ({
  ticket,
  onClose,
  onStatusChange,
  onRetriage,
  isUpdating,
}) => {
  const [retriageLoading, setRetriageLoading] = useState(false);

  if (!ticket) return null;

  const handleRetriage = async () => {
    setRetriageLoading(true);
    try {
      await onRetriage(ticket.id);
    } finally {
      setRetriageLoading(false);
    }
  };

  const statuses: TicketStatus[] = ['open', 'in_progress', 'resolved'];

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-content" style={{ maxWidth: 720 }}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <span style={{ fontFamily: 'var(--font-mono)', color: '#64748b' }}>
                Ticket #{ticket.id}
              </span>
              <span className={`badge badge-${ticket.status}`}>
                {ticket.status.replace('_', ' ')}
              </span>
              {ticket.needs_review === 1 && (
                <span className="badge badge-review">
                  <AlertTriangle size={12} /> Needs Human Review
                </span>
              )}
            </div>
            <h2 className="modal-title">{ticket.title}</h2>
          </div>
          <button className="close-btn" onClick={onClose} disabled={isUpdating}>
            <X size={20} />
          </button>
        </div>

        {/* AI Agent Triage Analysis Box */}
        <div className="detail-ai-box">
          <div className="ai-header">
            <Sparkles size={16} />
            <span>AI Triage Synthesis</span>
          </div>
          <p style={{ fontSize: '0.92rem', color: '#e2e8f0', lineHeight: 1.5 }}>
            {ticket.summary || 'No summary generated.'}
          </p>

          <div style={{ display: 'flex', gap: 12, marginTop: 14, flexWrap: 'wrap' }}>
            <div style={{ fontSize: '0.82rem' }}>
              <span style={{ color: '#94a3b8', marginRight: 6 }}>Classified Category:</span>
              <strong style={{ color: '#f8fafc', textTransform: 'uppercase' }}>
                {ticket.category || 'N/A'}
              </strong>
            </div>
            <div style={{ fontSize: '0.82rem' }}>
              <span style={{ color: '#94a3b8', marginRight: 6 }}>Assigned Priority:</span>
              <strong style={{ color: '#f8fafc', textTransform: 'uppercase' }}>
                {ticket.priority || 'N/A'}
              </strong>
            </div>
          </div>
        </div>

        {/* Customer Inquiry Body */}
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
            Customer Message
          </h3>
          <div
            style={{
              backgroundColor: 'var(--bg-tertiary)',
              padding: 16,
              borderRadius: 'var(--radius-md)',
              fontSize: '0.92rem',
              color: '#cbd5e1',
              whiteSpace: 'pre-wrap',
              lineHeight: 1.6,
              border: '1px solid var(--border-color)',
            }}
          >
            {ticket.body}
          </div>
        </div>

        {/* Ticket Metadata */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: '#64748b', marginBottom: 24 }}>
          <Calendar size={14} />
          <span>Received at {new Date(ticket.created_at).toLocaleString()}</span>
        </div>

        {/* Status Transition & Actions Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '1px solid var(--border-color)',
            paddingTop: 20,
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', marginRight: 8 }}>
              Change Status:
            </span>
            <div style={{ display: 'inline-flex', gap: 6 }}>
              {statuses.map((s) => (
                <button
                  key={s}
                  className={`btn btn-sm ${ticket.status === s ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => onStatusChange(ticket.id, s)}
                  disabled={isUpdating || ticket.status === s}
                >
                  {ticket.status === s && <Check size={14} />}
                  <span>{s.replace('_', ' ')}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            className="btn btn-secondary btn-sm"
            onClick={handleRetriage}
            disabled={retriageLoading || isUpdating}
            title="Re-run AI classifier"
          >
            <RefreshCw size={14} className={retriageLoading ? 'spinner' : ''} style={{ margin: 0 }} />
            <span>{retriageLoading ? 'Re-triaging...' : 'Re-triage with AI'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
