import React from 'react';
import { ArrowRight, Plus } from 'lucide-react';
import { StockAttentionPanel } from './StockAttentionPanel';
import { StockHealthPanel } from './StockHealthPanel';
import { StockOverviewStats } from './StockOverviewStats';
import { StockQuickActions } from './StockQuickActions';
import { StockRecentMovementPanel } from './StockRecentMovementPanel';
import { stockHealthGroups } from '../../utils/stockOverview';

export const StockOverview = ({
  dashboard,
  items,
  purchases,
  ledger,
  formatMoney,
  onNavigate,
}) => {
  const { lowItems, outItems, healthyItems, healthPercentage } = stockHealthGroups(items);
  const pendingPOs = purchases.filter((po) =>
    ['Draft', 'Ordered', 'Partially Received'].includes(po.status),
  );

  return (
    <div className="stock-management-view stock-dashboard-overview">
      <div className="stock-overview-toolbar">
        <div>
          <h2>Inventory overview</h2>
          <p>See stock levels, items needing attention and recent movement.</p>
        </div>
        <div className="stock-overview-toolbar-actions">
          <button type="button" onClick={() => onNavigate('/stock')} className="stock-overview-outline">Quick Stock <ArrowRight size={16} /></button>
          <button type="button" onClick={() => onNavigate('/stock/add')} className="stock-overview-primary"><Plus size={16} /> Add Part</button>
        </div>
      </div>

      <StockOverviewStats dashboard={dashboard} items={items}
        lowItems={lowItems} outItems={outItems} formatMoney={formatMoney} />

      <section className="stock-dashboard-bottom-grid" aria-label="Stock health and attention">
        <StockAttentionPanel lowItems={lowItems} outItems={outItems} onNavigate={onNavigate} />
        <StockHealthPanel stockHealth={healthPercentage} healthyItems={healthyItems}
          lowItems={lowItems} outItems={outItems} pendingPOs={pendingPOs} dashboard={dashboard} />
      </section>

      <StockQuickActions onNavigate={onNavigate} />
      <StockRecentMovementPanel ledger={ledger} onNavigate={onNavigate} />
    </div>
  );
};
