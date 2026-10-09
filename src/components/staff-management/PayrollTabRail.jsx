import React, { useEffect, useRef } from 'react';
import { WalletCards, History, CreditCard } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';

const tabs = [
  { label: 'Daily Wages', path: '/payroll/daily-wages', icon: WalletCards },
  { label: 'Daily History', path: '/payroll/daily-wages/history', icon: History },
  { label: 'Payments', path: '/payroll/payments', icon: CreditCard },
];

export const PayrollTabRail = () => {
  const railRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      railRef.current?.querySelector('.payroll-subnav-item.active')?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }, 60);

    return () => window.clearTimeout(timer);
  }, [location.pathname]);

  return (
    <nav className="payroll-tabs-shell" aria-label="Payroll navigation">
      <div ref={railRef} className="payroll-subnav">
        {tabs.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end
            className={({ isActive }) =>
              `payroll-subnav-item ${isActive ? 'active' : ''}`
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
