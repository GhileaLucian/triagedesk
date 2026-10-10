import React from 'react';
import { Bot, Plus, RefreshCw } from 'lucide-react';

interface HeaderProps {
  onNewTicket: () => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onNewTicket, onRefresh, isLoading }) => {
  return (
    <header className="app-header">
      <div className="brand-section">
        <div className="brand-logo">
          <Bot size={24} color="#ffffff" />
        </div>
        <div>
          <h1 className="brand-title">TriageDesk</h1>
          <p className="brand-tagline">Autonomous AI Support Ticket Classifier & Routing</p>
        </div>
      </div>

      <div className="header-actions">
        <div className="provider-badge" title="Active AI Triage Provider">
          <span className="provider-dot" />
          <span>Claude API / Mock Active</span>
        </div>

        <button
          className="btn btn-secondary btn-sm"
          onClick={onRefresh}
          disabled={isLoading}
          title="Refresh ticket queue"
        >
          <RefreshCw size={15} className={isLoading ? 'spinner' : ''} style={{ margin: 0 }} />
          <span>Refresh</span>
        </button>

        <button className="btn btn-primary" onClick={onNewTicket}>
          <Plus size={18} />
          <span>New Ticket</span>
        </button>
      </div>
    </header>
  );
};
