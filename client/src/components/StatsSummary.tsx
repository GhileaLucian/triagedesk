import React from 'react';
import { Stats } from '../types';
import { Inbox, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';

interface StatsSummaryProps {
  stats: Stats | null;
}

export const StatsSummary: React.FC<StatsSummaryProps> = ({ stats }) => {
  if (!stats) return null;

  return (
    <section className="stats-grid" aria-label="Ticket Overview Statistics">
      <div className="stat-card">
        <div className="stat-header">
          <span className="stat-label">Total Volume</span>
          <Inbox size={18} color="#94a3b8" />
        </div>
        <div className="stat-value">{stats.total}</div>
      </div>

      <div className="stat-card">
        <div className="stat-header">
          <span className="stat-label">Open Queue</span>
          <Clock size={18} color="#60a5fa" />
        </div>
        <div className="stat-value" style={{ color: '#60a5fa' }}>
          {stats.byStatus.open}
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-header">
          <span className="stat-label">In Progress</span>
          <Clock size={18} color="#fbbf24" />
        </div>
        <div className="stat-value" style={{ color: '#fbbf24' }}>
          {stats.byStatus.in_progress}
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-header">
          <span className="stat-label">Resolved</span>
          <CheckCircle2 size={18} color="#34d399" />
        </div>
        <div className="stat-value" style={{ color: '#34d399' }}>
          {stats.byStatus.resolved}
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-header">
          <span className="stat-label">High Priority</span>
          <AlertTriangle size={18} color="#f87171" />
        </div>
        <div className="stat-value" style={{ color: '#f87171' }}>
          {stats.byPriority.high}
        </div>
      </div>
    </section>
  );
};
