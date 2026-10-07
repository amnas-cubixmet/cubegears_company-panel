import React from 'react';
import { StockAttentionPanel } from './StockAttentionPanel';
import { StockHealthPanel } from './StockHealthPanel';
import { StockOverviewStats } from './StockOverviewStats';
import { StockQuickActions } from './StockQuickActions';
import { StockRecentMovementPanel } from './StockRecentMovementPanel';

export const StockOverview = ({
  dashboard,
  items,
  purchases,
  ledger,
  formatMoney,
  onNavigate,
}) => {
  const lowItems = items.filter(
    (item) => Number(item.onHand || 0) > 0 && Number(item.available || 0) <= Number(item.minimumStock || 0),
  );
  const outItems = items.filter((item) => Number(item.onHand || 0) <= 0);
  const pendingPOs = purchases.filter((po) =>
    ['Draft', 'Ordered', 'Partially Received'].includes(po.status),
  );
  const healthyItems = Math.max(0, items.length - lowItems.length - outItems.length);
  const stockHealth = items.length
    ? Math.round((healthyItems / items.length) * 100)
    : 100;

  return (
    <div className="stock-management-view stock-dashboard-overview">
      <StockOverviewStats
        dashboard={dashboard}
        items={items}
        lowItems={lowItems}
        outItems={outItems}
        formatMoney={formatMoney}
      />

      <section className="stock-dashboard-bottom-grid">
        <StockHealthPanel
          stockHealth={stockHealth}
          healthyItems={healthyItems}
          lowItems={lowItems}
          outItems={outItems}
          pendingPOs={pendingPOs}
          dashboard={dashboard}
        />

        <StockAttentionPanel
          lowItems={lowItems}
          outItems={outItems}
          onNavigate={onNavigate}
        />

        <StockQuickActions onNavigate={onNavigate} />
      </section>

      <StockRecentMovementPanel
        ledger={ledger}
        onNavigate={onNavigate}
      />
    </div>
  );
};
