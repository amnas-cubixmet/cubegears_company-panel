import React from 'react';
import { Activity } from 'lucide-react';

export const StockHealthPanel = ({
  stockHealth,
  healthyItems,
  lowItems,
  outItems,
  pendingPOs,
  dashboard,
}) => (
  <article className="stock-dashboard-panel stock-health-panel">
    <header className="stock-dashboard-panel-title">
      <div>
        <h2>Inventory Health</h2>
        <p>Current workshop stock availability.</p>
      </div>
      <Activity size={15} />
    </header>

    <div className="stock-health-score">
      <div
        className="stock-health-ring"
        style={{ '--stock-health': `${stockHealth * 3.6}deg` }}
      >
        <div>
          <strong>{stockHealth}%</strong>
          <span>Healthy</span>
        </div>
      </div>

      <div className="stock-health-breakdown">
        <div><span className="is-success" /><p>Healthy stock</p><strong>{healthyItems}</strong></div>
        <div><span className="is-warning" /><p>Low stock</p><strong>{lowItems.length}</strong></div>
        <div><span className="is-danger" /><p>Out of stock</p><strong>{outItems.length}</strong></div>
      </div>
    </div>

    <div className="stock-health-footer">
      <div><span>Pending POs</span><strong>{pendingPOs.length}</strong></div>
      <div><span>Today Stock In</span><strong>{dashboard?.receivedToday || 0}</strong></div>
      <div><span>Today Stock Out</span><strong>{dashboard?.issuedToday || 0}</strong></div>
    </div>
  </article>
);
