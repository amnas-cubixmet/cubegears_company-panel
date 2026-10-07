import React from 'react';
import {
  CustomerManagementHeader,
  CustomerManagementTabs,
} from '../../components/customers';
import { CustomerManagementSection } from './CustomerManagementSection';
import '../../styles/customer-management.css';

export const CustomerManagement = ({ section = 'overview' }) => (
  <div className="customer-management-page cg-customers">
    <CustomerManagementHeader />
    <CustomerManagementTabs />

    <main className="customer-management-content">
      <CustomerManagementSection section={section} />
    </main>
  </div>
);
