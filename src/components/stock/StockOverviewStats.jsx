import React from 'react';
import { AlertTriangle, IndianRupee, Package, PackageMinus } from 'lucide-react';

export const StockOverviewStats = ({ dashboard, items, lowItems, outItems, formatMoney }) => {
  const cards = [
    { label: 'Total Parts', value: dashboard?.totalItems ?? items.length,
      meta: 'Parts in inventory', icon: Package },
    { label: 'Stock Value', value: formatMoney(dashboard?.totalValue ?? items.reduce(
      (sum, item) => sum + Number(item.onHand || 0) * Number(item.costPrice || 0), 0)),
      meta: 'At recorded purchase cost', icon: IndianRupee },
    { label: 'Low Stock', value: lowItems.length,
      meta: 'Reorder soon', icon: AlertTriangle, tone: 'warning' },
    { label: 'Out of Stock', value: outItems.length,
      meta: 'Available quantity is zero', icon: PackageMinus, tone: 'danger' },
  ];

  return (
    <section className="stock-dashboard-stats" aria-label="Stock summary">
      {cards.map(({ label, value, meta, icon: Icon, tone = 'primary' }) => (
        <article key={label} className="stock-dashboard-stat-card">
          <div className="stock-dashboard-stat-top">
            <div><span>{label}</span><strong title={String(value)}>{value}</strong></div>
            <i className={`is-${tone}`}><Icon size={19} aria-hidden="true" /></i>
          </div>
          <small>{meta}</small>
        </article>
      ))}
    </section>
  );
};
