import React from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { MobileBottomNav } from './MobileBottomNav';
import { Footer } from './Footer';
import { AppBreadcrumbs } from './AppBreadcrumbs';
import '../../styles/layout.css';

export const DashboardLayout = ({ children }) => {
  const location = useLocation();
  const isInvoiceWorkspace =
    location.pathname.startsWith('/invoices/') ||
    location.pathname.startsWith('/quotations/');
  const isDashboard = location.pathname === '/dashboard';

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-main-column">
        <Header />

        <main className="app-scroll-area">
          <div className={`app-content ${isDashboard ? 'is-dashboard-content' : ''}`}>
            {!isDashboard && <AppBreadcrumbs />}
            {children}
          </div>

          {!isInvoiceWorkspace && <Footer />}
        </main>
      </div>

      {!isInvoiceWorkspace && <MobileBottomNav />}
    </div>
  );
};
