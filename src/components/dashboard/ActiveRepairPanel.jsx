import React from 'react';
import { Activity, ArrowRight, Car, PackageSearch } from 'lucide-react';

export const ActiveRepairPanel = ({ activeRepair, stockAlerts, onOpenJob, onReviewStock }) => (
  <aside className="repair-pane">
    <button
      type="button"
      className="active-repair-card active-repair-clickable"
      onClick={onOpenJob}
      aria-label="Open active repair job"
    >
      <div className="vehicle-visual"><Car size={52} strokeWidth={1.1} /></div>

      <div className="active-repair-main">
        <div>
          <strong>{activeRepair?.vehicle || 'Vehicle'}</strong>
          <small>{activeRepair?.jobNumber || activeRepair?.id}</small>
        </div>
        <span className="status-pill is-success">In Progress</span>
      </div>

      <div className="repair-meta">
        <div><small>Customer</small><strong>{activeRepair?.customer || '—'}</strong></div>
        <div><small>Mechanic</small><strong>{activeRepair?.mechanic || 'Unassigned'}</strong></div>
      </div>

      <div className="overall-progress">
        <div><span>Overall Progress</span><strong>70%</strong></div>
        <div className="progress-track"><span /></div>
      </div>

      <div className="active-repair-open-hint">
        <span>Open Job Card</span>
        <ArrowRight size={11} />
      </div>
    </button>

    <div className="insights-card">
      <div className="insights-title"><Activity size={13} /><strong>Smart Insights</strong></div>
      <div className="insight-list">
        {(stockAlerts || []).slice(0, 2).map((alert) => (
          <button key={alert.id} type="button" className="insight-item" onClick={onReviewStock}>
            <PackageSearch size={13} className={alert.priority === 'critical' ? 'danger-icon' : 'warning-icon'} />
            <span>
              <strong>{alert.partName}</strong>
              <small>{alert.message}. Stock {alert.currentStock}.</small>
            </span>
          </button>
        ))}
      </div>
      <button type="button" className="dashboard-button is-primary full-width" onClick={onReviewStock}>Review Stock</button>
    </div>
  </aside>
);
