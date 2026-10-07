import React from 'react';
import { AlertTriangle, PackageMinus } from 'lucide-react';

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
          <p>Items requiring stock action.</p>
        </div>
        <button type="button" onClick={() => onNavigate('/stock/items')}>View All</button>
      </header>

      <div className="stock-attention-list">
        {attention.map((item) => (
          <button
            key={`${item.id}-${item.attention}`}
            type="button"
            onClick={() => onNavigate(`/stock/items/${item.id}`)}
          >
            <span className={item.attention === 'Out of Stock' ? 'is-danger' : 'is-warning'}>
              {item.attention === 'Out of Stock'
                ? <PackageMinus size={14} />
                : <AlertTriangle size={14} />}
            </span>
            <div>
              <strong>{item.partName}</strong>
              <small>{item.sku} · {item.location || 'No rack location'}</small>
            </div>
            <b>{item.available || 0}</b>
          </button>
        ))}

        {!attention.length && (
          <div className="stock-dashboard-empty">All stock levels are healthy.</div>
        )}
      </div>
    </article>
  );
};
