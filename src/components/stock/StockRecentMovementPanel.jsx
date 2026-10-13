import React from 'react';
import { ArrowRight, ArrowLeftRight } from 'lucide-react';
import { normalizeStockMovement } from '../../utils/stockOverview';

export const StockRecentMovementPanel = ({ ledger, onNavigate }) => {
  const movements = ledger.slice(0, 8).map(normalizeStockMovement);
  const formatQuantity = (value) =>
    value === null ? '—' : `${value > 0 ? '+' : ''}${value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

  return (
    <section className="stock-dashboard-records">
      <header className="stock-dashboard-section-title">
        <div>
          <h2>Recent Stock Movements</h2>
          <p>Latest received, issued, returned and adjusted parts.</p>
        </div>
        <button type="button" onClick={() => onNavigate('/stock/movements')}>
          <ArrowLeftRight size={16} aria-hidden="true" /> Full History <ArrowRight size={14} aria-hidden="true" />
        </button>
      </header>

      {movements.length ? (
        <div className="stock-overview-ledger">
          <table>
            <thead><tr>
              <th scope="col">Movement</th>
              <th scope="col">Part</th>
              <th scope="col">Reference</th>
              <th scope="col">Date</th>
              <th scope="col">Quantity</th>
            </tr></thead>
            <tbody>
              {movements.map((movement, index) => (
                <tr key={movement.id ?? index}>
                  <td data-label="Movement">
                    <span className={`stock-overview-type is-${movement.typeKey || 'other'}`}>{movement.label}</span>
                  </td>
                  <td data-label="Part"><strong>{movement.partName}</strong></td>
                  <td data-label="Reference">{movement.reference}</td>
                  <td data-label="Date">{movement.dateLabel}</td>
                  <td data-label="Quantity">
                    <b className={movement.quantity > 0 ? 'is-in' : movement.quantity < 0 ? 'is-out' : ''}>
                      {formatQuantity(movement.quantity)}
                    </b>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <div className="stock-dashboard-empty">No stock movements yet. Receiving or issuing parts will appear here.</div>}
    </section>
  );
};
