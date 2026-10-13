import React from 'react';
import { AlertTriangle, ArrowRight, CheckCircle2, PackageMinus } from 'lucide-react';
import { availableStock } from '../../utils/stockOverview';

export const StockAttentionPanel = ({ lowItems, outItems, onNavigate }) => {
  const attention = [
    ...outItems.map((item) => ({ ...item, attention: 'Out of Stock' })),
    ...lowItems.map((item) => ({ ...item, attention: 'Low Stock' })),
  ].slice(0, 6);

  return (
    <article className="stock-dashboard-panel stock-attention-panel">
      <header className="stock-dashboard-panel-title">
        <div>
          <h2>Needs Attention</h2>
          <p>Parts to replenish or purchase.</p>
        </div>
        <button type="button" onClick={() => onNavigate('/stock/items')}>
          View All <ArrowRight size={14} aria-hidden="true" />
        </button>
      </header>

      <div className="stock-attention-list">
        {attention.map((item) => (
          <button key={item.id} type="button"
            onClick={() => onNavigate(`/stock/items/${item.id}`)}
            aria-label={`View ${item.partName || item.name}, ${item.attention}`}>
            <span className={item.attention === 'Out of Stock' ? 'is-danger' : 'is-warning'}>
              {item.attention === 'Out of Stock'
                ? <PackageMinus size={17} aria-hidden="true" />
                : <AlertTriangle size={17} aria-hidden="true" />}
            </span>
            <div>
              <strong>{item.partName || item.name}</strong>
              <small>{item.sku || 'No SKU'} · {item.attention}</small>
            </div>
            <b>{Math.max(0, availableStock(item))} <small>{item.unit || 'PCS'}</small></b>
          </button>
        ))}

        {!attention.length && (
          <div className="stock-dashboard-empty stock-attention-healthy">
            <CheckCircle2 size={22} aria-hidden="true" />
            <strong>No urgent stock alerts</strong>
            <span>Items below minimum stock will appear here.</span>
          </div>
        )}
      </div>
    </article>
  );
};
