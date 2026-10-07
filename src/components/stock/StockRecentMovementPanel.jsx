import React from 'react';
import { ArrowLeftRight } from 'lucide-react';

const statusClass = (value = '') =>
  `is-${String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;

export const StockRecentMovementPanel = ({ ledger, onNavigate }) => (
  <section className="stock-dashboard-records">
    <header className="stock-dashboard-section-title">
      <div>
        <h2>Recent Stock Movement</h2>
        <p>Latest inward, issue, return and adjustment activity.</p>
      </div>
      <button type="button" onClick={() => onNavigate('/stock/movements')}>
        <ArrowLeftRight size={12} />
        Full Ledger
      </button>
    </header>

    <div className="stock-overview-ledger">
      <div className="stock-overview-ledger-head">
        <span>Type</span><span>Part</span><span>Reference</span><span>Qty</span><span>Balance</span>
      </div>

      {ledger.slice(0, 8).map((movement) => (
        <div key={movement.id} className="stock-overview-ledger-row">
          <span className={`stock-status ${statusClass(movement.type)}`}>{movement.type}</span>
          <div><strong>{movement.partName}</strong><small>{movement.date}</small></div>
          <span>{movement.jobRef || '—'}</span>
          <b>{movement.qtyIn ? `+${movement.qtyIn}` : `-${movement.qtyOut}`}</b>
          <em>{movement.balanceAfter}</em>
        </div>
      ))}

      {!ledger.length && (
        <div className="stock-dashboard-empty">No stock movement recorded yet.</div>
      )}
    </div>
  </section>
);
