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
        <p>How many parts are above minimum stock.</p>
      </div>
      <Activity size={18} aria-hidden="true" />
    </header>

    <div className="stock-health-score">
      <div
        className="stock-health-ring"
        role="img"
        aria-label={stockHealth === null ? 'No stock data yet' : `${stockHealth}% of inventory items have healthy stock levels`}
        style={{ '--stock-health': `${(stockHealth ?? 0) * 3.6}deg` }}
      >
        <div>
          <strong>{stockHealth === null ? '—' : `${stockHealth}%`}</strong>
          <span>{stockHealth === null ? 'No items' : 'Healthy'}</span>
        </div>
      </div>

      <div className="stock-health-breakdown">
        <div><span className="is-success" /><p>Healthy stock</p><strong>{healthyItems}</strong></div>
        <div><span className="is-warning" /><p>Low stock</p><strong>{lowItems.length}</strong></div>
        <div><span className="is-danger" /><p>Out of stock</p><strong>{outItems.length}</strong></div>
      </div>
    </div>

    <div className="stock-health-footer">
      <div><span>Pending Orders</span><strong>{pendingPOs.length}</strong></div>
      <div><span>Receipts Today</span><strong>{dashboard?.receivedToday ?? 0}</strong></div>
      <div><span>Issues Today</span><strong>{dashboard?.issuedToday ?? 0}</strong></div>
    </div>
  </article>
);
