import React, { useEffect, useRef } from 'react';
import {
  BarChart3,
  BellRing,
  Clock3,
  LayoutDashboard,
  Plus,
  ReceiptText,
  Users,
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';

const customerTabs = [
  { label: 'Overview', path: '/customers/overview', icon: LayoutDashboard },
  { label: 'All Customers', path: '/customers/all', icon: Users },
  { label: 'Add Customer', path: '/customers/new', icon: Plus },
  { label: 'Service History', path: '/customers/service-history', icon: Clock3 },
  { label: 'Outstanding', path: '/customers/outstanding', icon: ReceiptText },
  { label: 'Reminders', path: '/customers/reminders', icon: BellRing },
  { label: 'Reports', path: '/customers/reports', icon: BarChart3 },
];

export const CustomerManagementTabs = () => {
  const railRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      railRef.current?.querySelector('.customer-management-tab.active')?.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }, 40);

    return () => window.clearTimeout(timer);
  }, [location.pathname]);

  return (
    <nav className="customer-management-tabs" aria-label="Customer Management navigation">
      <div ref={railRef} className="customer-management-tabs__rail">
        {customerTabs.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `customer-management-tab ${isActive ? 'active' : ''}`
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
