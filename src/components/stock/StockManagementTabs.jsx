import React, { useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const stockTabs = [
  { label: 'Overview', path: '/stock/overview' },
  { label: 'Parts & Products', path: '/stock/items' },
  { label: 'Categories', path: '/stock/categories' },
  { label: 'Stock In/Out', path: '/stock/movements' },
  { label: 'Purchase Orders', path: '/stock/purchase-orders' },
  { label: 'Suppliers', path: '/stock/suppliers' },
  { label: 'Transfers', path: '/stock/transfers' },
  { label: 'Adjustments', path: '/stock/adjustments' },
  { label: 'Stock Audit', path: '/stock/audit' },
  { label: 'Reports', path: '/stock/reports' }
];

export const StockManagementTabs = () => {
  const location = useLocation();
  const railRef = useRef(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      railRef.current?.querySelector('.stock-management-tab.active')?.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest'
      });
    }, 40);
    return () => window.clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div className="stock-management-tabs">
      <div ref={railRef} className="stock-management-tabs__rail scroll-hidden">
        {stockTabs.map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={({ isActive }) => `stock-management-tab ${isActive ? 'active' : ''}`}
          >
            {tab.label}
          </NavLink>
        ))}
      </div>
    </div>
  );
};
