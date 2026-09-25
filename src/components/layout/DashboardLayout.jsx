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
    <div className="flex h-dvh w-full min-w-0 overflow-hidden bg-app text-content">
      <Sidebar />
      <div className="flex h-dvh min-w-0 flex-1 flex-col overflow-hidden">
        <Header />
        <main className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain pb-[calc(72px+env(safe-area-inset-bottom))] md:pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="mx-auto w-full max-w-[1600px] min-w-0 px-3 py-3 sm:px-4 sm:py-4 lg:px-6 lg:py-5 xl:px-8">
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
