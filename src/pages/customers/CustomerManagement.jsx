import React from 'react';
import { CustomerManagementTabs } from '../../components/customers/CustomerManagementTabs';
import { CustomerManagementSection } from './CustomerManagementSection';

export const CustomerManagement = ({ section = 'overview' }) => (
  <div className="customer-management-page cg-customers">
    <header className="customer-management-header">
      <h1>Customers Management</h1>
      <p>Customers, vehicles, service history, outstanding payments, reminders and workshop relationships.</p>
    </header>

    <CustomerManagementTabs />
    <CustomerManagementSection section={section} />
  </div>
);
