import React from 'react';
import { useLocation, useParams } from 'react-router-dom';
import {
  StockManagementHeader,
  StockManagementTabs,
} from '../../components/stock';
import { StockManagementSection } from './StockManagementSection';
import '../../styles/stock-management.css';

const resolveSection = (pathname, itemId) => {
  if (itemId) return 'item-detail';
  if (pathname.endsWith('/overview') || pathname === '/stock') return 'overview';
  if (pathname.endsWith('/items')) return 'items';
  if (pathname.endsWith('/categories')) return 'categories';
  if (
    pathname.endsWith('/movements') ||
    pathname.endsWith('/in') ||
    pathname.endsWith('/issue') ||
    pathname.endsWith('/return') ||
    pathname.endsWith('/ledger')
  ) return 'movements';
  if (pathname.endsWith('/purchase-orders') || pathname.endsWith('/purchases')) return 'purchase-orders';
  if (pathname.endsWith('/suppliers')) return 'suppliers';
  if (pathname.endsWith('/transfers') || pathname.endsWith('/transfer')) return 'transfers';
  if (pathname.endsWith('/adjustments')) return 'adjustments';
  if (pathname.endsWith('/audit') || pathname.endsWith('/count')) return 'audit';
  if (pathname.endsWith('/reports')) return 'reports';
  if (pathname.endsWith('/low-stock')) return 'items';
  if (pathname.endsWith('/reservations')) return 'movements';
  return 'overview';
};

export const StockManagement = ({ section }) => {
  const location = useLocation();
  const { itemId } = useParams();
  const activeSection = section || resolveSection(location.pathname, itemId);

  return (
    <div className="stock-management-page cg-stock">
      <StockManagementHeader />
      {activeSection !== 'item-detail' && <StockManagementTabs />}
      <main className="stock-management-content">
        <StockManagementSection section={activeSection} itemId={itemId} />
      </main>
    </div>
  );
};

export default StockManagement;
