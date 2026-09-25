import React, { useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const customerTabs = [
  { label: 'Overview', path: '/customers/overview' },
  { label: 'All Customers', path: '/customers/all' },
  { label: 'Vehicles', path: '/customers/vehicles' },
  { label: 'Service History', path: '/customers/service-history' },
  { label: 'Outstanding', path: '/customers/outstanding' },
  { label: 'Reminders', path: '/customers/reminders' },
  { label: 'Reports', path: '/customers/reports' }
];

export const CustomerManagementTabs = () => {
  const railRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      railRef.current?.querySelector('.customer-management-tab.active')?.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest'
      });
    }, 40);
    return () => window.clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div className="customer-management-tabs">
      <div ref={railRef} className="customer-management-tabs__rail scroll-hidden">
        {customerTabs.map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={({ isActive }) =>
              `customer-management-tab ${isActive ? 'active' : ''}`
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </div>
    </div>
  );
};
