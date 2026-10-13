import React from 'react';
import { ArrowRight, ArrowRightLeft, ClipboardCheck, Plus, ShoppingCart, Truck } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { hasPermission } from '../../utils/permissions';

const actions = [
  ['Add New Part', '/stock/add', Plus, 'stock.create'],
  ['Stock In / Out', '/stock/movements', ArrowRightLeft, 'stock.create'],
  ['Purchase Orders', '/stock/purchase-orders', ShoppingCart, 'stock.view'],
  ['Suppliers', '/stock/suppliers', Truck, 'stock.view'],
  ['Stock Audit', '/stock/audit', ClipboardCheck, 'stock.view'],
];

export const StockQuickActions = ({ onNavigate }) => {
  const { user } = useAuth();
  const visibleActions = actions.filter(([, , , permission]) => hasPermission(user, permission));

  if (!visibleActions.length) return null;

  return (
    <section className="stock-dashboard-panel stock-quick-actions-panel">
      <header className="stock-dashboard-panel-title">
        <div><h2>Quick Actions</h2><p>Common workshop inventory tasks.</p></div>
      </header>
      <div className="stock-dashboard-quick-actions">
        {visibleActions.map(([label, path, Icon]) => (
          <button key={path} type="button" onClick={() => onNavigate(path)}>
            <span><Icon size={17} aria-hidden="true" />{label}</span>
            <ArrowRight size={15} aria-hidden="true" />
          </button>
        ))}
      </div>
    </section>
  );
};
