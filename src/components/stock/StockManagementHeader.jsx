import React from 'react';
import { Boxes } from 'lucide-react';

export const StockManagementHeader = () => (
  <header className="stock-dashboard-header">
    <div>
      <h1>Stock Management</h1>
      <p>Parts, purchases, workshop issues, transfers, suppliers and inventory control.</p>
    </div>

    <div className="stock-dashboard-header-badge">
      <Boxes size={13} />
      <span>Inventory Control</span>
    </div>
  </header>
);
