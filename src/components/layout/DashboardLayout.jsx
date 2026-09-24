import React from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { MobileBottomNav } from './MobileBottomNav';
import { Footer } from './Footer';
import { AppBreadcrumbs } from './AppBreadcrumbs';

export const DashboardLayout = ({ children }) => {
  const location = useLocation();
  const isInvoiceWorkspace =
    location.pathname.startsWith('/invoices/') ||
    location.pathname.startsWith('/quotations/');

  return (
    <div className={`app-shell${isInvoiceWorkspace ? ' invoice-workspace-shell' : ''}`}>
      <Sidebar />

      <div className="main-area">
        <Header />

        <main className="main-content scroll-hidden cg-main-content">
          <div className="cg-main-content__body">
            <AppBreadcrumbs />
            {children}
          </div>
          {!isInvoiceWorkspace && <Footer />}
        </main>
      </div>

      {!isInvoiceWorkspace && <MobileBottomNav />}
    </div>
  );
};
