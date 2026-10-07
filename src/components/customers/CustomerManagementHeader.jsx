import React from 'react';
import { UsersRound } from 'lucide-react';

export const CustomerManagementHeader = () => (
  <header className="customer-dashboard-header">
    <div>
      <h1>Customers Management</h1>
      <p>Customers, vehicles, service history, outstanding payments and workshop relationships.</p>
    </div>

    <div className="customer-dashboard-header-badge">
      <UsersRound size={13} />
      <span>Customer CRM</span>
    </div>
  </header>
);
