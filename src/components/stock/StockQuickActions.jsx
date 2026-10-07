import React from 'react';
import { ArrowRightLeft, ClipboardCheck, Plus, ShoppingCart, Truck } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { hasPermission } from '../../utils/permissions';

const actions = [
  ['Add Item', '/stock/add', Plus, 'stock.create'],
  ['Stock Movement', '/stock/movements', ArrowRightLeft, 'stock.create'],
  ['Purchase Orders', '/stock/purchase-orders', ShoppingCart, 'stock.view'],
  ['Suppliers', '/stock/suppliers', Truck, 'stock.view'],
  ['Stock Audit', '/stock/audit', ClipboardCheck, 'stock.view'],
];

export const StockQuickActions = ({ onNavigate }) => {
  const { user } = useAuth();

  return (
    <article className="stock-dashboard-panel">
      <header className="stock-dashboard-panel-title">
        <div>
          <h2>Quick Actions</h2>
          <p>Common inventory operations.</p>
        </div>
        <ShoppingCart size={15} />
      </header>

      <div className="stock-dashboard-quick-actions">
        {actions
          .filter(([, , , permission]) => hasPermission(user, permission))
          .map(([label, path, Icon]) => (
            <button key={path} type="button" onClick={() => onNavigate(path)}>
              <span><Icon size={12} />{label}</span>
              <span>›</span>
            </button>
          ))}
      </div>
    </article>
  );
};
