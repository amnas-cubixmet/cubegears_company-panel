import React from 'react';
import { FinancePanel } from './FinancePanel';
import { QuickActionsPanel } from './QuickActionsPanel';
import { WorkshopStaffPanel } from './WorkshopStaffPanel';

export const DashboardBottomGrid = ({ data, user, onNavigate }) => (
  <section className="dashboard-bottom-grid">
    <FinancePanel payments={data?.payments} />
    <WorkshopStaffPanel staff={data?.staffAvailability} />
    <QuickActionsPanel user={user} onNavigate={onNavigate} />
  </section>
);
