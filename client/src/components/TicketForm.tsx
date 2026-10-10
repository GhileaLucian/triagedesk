import React, { useState } from 'react';
import { CreateTicketInput } from '../types';
import { Sparkles, X, AlertCircle } from 'lucide-react';

interface TicketFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTicketInput) => Promise<void>;
  isSubmitting: boolean;
}

export const TicketForm: React.FC<TicketFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}) => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [errors, setErrors] = useState<{ title?: string; body?: string }>({});

  if (!isOpen) return null;

  const validate = () => {
    const errs: { title?: string; body?: string } = {};

    if (title.trim().length < 3) {
      errs.title = 'Title must be at least 3 characters long';
    } else if (title.trim().length > 120) {
      errs.title = 'Title cannot exceed 120 characters';
    }

    if (body.trim().length < 10) {
      errs.body = 'Body description must be at least 10 characters long';
    } else if (body.trim().length > 5000) {
      errs.body = 'Body cannot exceed 5000 characters';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await onSubmit({ title: title.trim(), body: body.trim() });
      setTitle('');
      setBody('');
      setErrors({});
      onClose();
    } catch {
      // Error handled by parent toast/alert
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-content">
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Create Support Ticket</h2>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: 4 }}>
              Paste your raw customer inquiry. The AI agent will auto-classify priority and category.
            </p>
          </div>
          <button className="close-btn" onClick={onClose} disabled={isSubmitting}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="ticket-title">
              Subject Title *
            </label>
            <input
              id="ticket-title"
              className="form-input"
              placeholder="e.g. Invoiced twice for monthly subscription upgrade"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isSubmitting}
            />
            <div className="char-counter">{title.length} / 120</div>
            {errors.title && (
              <div className="form-error">
                <AlertCircle size={14} style={{ display: 'inline', marginRight: 4 }} />
                {errors.title}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="ticket-body">
              Message Body *
            </label>
            <textarea
              id="ticket-body"
              className="form-textarea"
              placeholder="Paste customer email, chat transcript, or incident log..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              disabled={isSubmitting}
            />
            <div className="char-counter">{body.length} / 5000</div>
            {errors.body && (
              <div className="form-error">
                <AlertCircle size={14} style={{ display: 'inline', marginRight: 4 }} />
                {errors.body}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="spinner" style={{ width: 16, height: 16, margin: 0 }} />
                  <span>AI Agent Triage...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Classify & Submit</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
