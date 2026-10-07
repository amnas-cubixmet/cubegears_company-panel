import React, { useEffect, useRef } from 'react';
import {
  BarChart3,
  Boxes,
  ClipboardCheck,
  FolderTree,
  LayoutDashboard,
  PackageSearch,
  Repeat2,
  Settings2,
  ShoppingCart,
  Truck,
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';

const stockTabs = [
  { label: 'Overview', path: '/stock/overview', icon: LayoutDashboard },
  { label: 'Parts & Products', path: '/stock/items', icon: Boxes },
  { label: 'Categories', path: '/stock/categories', icon: FolderTree },
  { label: 'Stock In/Out', path: '/stock/movements', icon: Repeat2 },
  { label: 'Purchase Orders', path: '/stock/purchase-orders', icon: ShoppingCart },
  { label: 'Suppliers', path: '/stock/suppliers', icon: Truck },
  { label: 'Transfers', path: '/stock/transfers', icon: PackageSearch },
  { label: 'Adjustments', path: '/stock/adjustments', icon: Settings2 },
  { label: 'Stock Audit', path: '/stock/audit', icon: ClipboardCheck },
  { label: 'Reports', path: '/stock/reports', icon: BarChart3 },
];

export const StockManagementTabs = () => {
  const location = useLocation();
  const railRef = useRef(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      railRef.current?.querySelector('.stock-management-tab.active')?.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }, 40);

    return () => window.clearTimeout(timer);
  }, [location.pathname]);

  return (
    <nav className="stock-management-tabs" aria-label="Stock Management navigation">
      <div ref={railRef} className="stock-management-tabs__rail">
        {stockTabs.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `stock-management-tab ${isActive ? 'active' : ''}`
            }
          >
            <Icon size={13} />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
