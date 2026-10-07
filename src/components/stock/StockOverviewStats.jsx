import React from 'react';
import { AlertTriangle, IndianRupee, Package, PackageMinus } from 'lucide-react';

export const StockOverviewStats = ({ dashboard, items, lowItems, outItems, formatMoney }) => {
  const cards = [
    {
      label: 'Total Items',
      value: dashboard?.totalItems ?? items.length,
      meta: 'inventory catalogue',
      icon: Package,
    },
    {
      label: 'Stock Value',
      value: formatMoney(dashboard?.totalValue || 0),
      meta: 'current inventory value',
      icon: IndianRupee,
    },
    {
      label: 'Low Stock',
      value: dashboard?.lowStock ?? lowItems.length,
      meta: 'needs replenishment',
      icon: AlertTriangle,
      tone: 'warning',
    },
    {
      label: 'Out of Stock',
      value: dashboard?.outOfStock ?? outItems.length,
      meta: 'immediate attention',
      icon: PackageMinus,
      tone: 'danger',
    },
  ];

  return (
    <section className="stock-dashboard-stats">
      {cards.map(({ label, value, meta, icon: Icon, tone = 'primary' }) => (
        <article key={label} className="stock-dashboard-stat-card">
          <div className="stock-dashboard-stat-top">
            <div>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
            <i className={`is-${tone}`}><Icon size={15} /></i>
          </div>
          <small>{meta}</small>
        </article>
      ))}
    </section>
  );
};
