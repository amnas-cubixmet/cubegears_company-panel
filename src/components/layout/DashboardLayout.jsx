import React from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { MobileBottomNav } from './MobileBottomNav';
import { Footer } from './Footer';

export const DashboardLayout = ({ children }) => {
  return (
    <div className="app-shell">
      <Sidebar />

      <div className="main-area">
        <Header />

        <main className="main-content scroll-hidden" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1 }}>
{children}
          </div>
          <Footer />
        </main>
      </div>

      <MobileBottomNav />
</div>
  );
};
