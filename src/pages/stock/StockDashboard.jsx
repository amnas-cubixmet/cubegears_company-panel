import React from 'react';

export const StockDashboard = () => (
  <div style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '12px' }}>
    <h2 style={{ color: '#f8fafc' }}>Stock Management Overview</h2>
    <p style={{ color: '#94a3b8' }}>Monitor warehouse inventory, transfers, and replenishment.</p>
  </div>
);

export const StockList = () => <div style={{ color: '#fff' }}>Stock List View</div>;
export const StockPurchase = () => <div style={{ color: '#fff' }}>Stock Purchase Form</div>;
export const StockAdjustment = () => <div style={{ color: '#fff' }}>Stock Adjustment Form</div>;
export const StockTransfer = () => <div style={{ color: '#fff' }}>Stock Transfer Form</div>;
export const StockHistory = () => <div style={{ color: '#fff' }}>Stock History Timeline</div>;
