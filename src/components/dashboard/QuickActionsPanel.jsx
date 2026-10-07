import React from 'react';
import {
  ArrowRight,
  Car,
  CreditCard,
  FileText,
  PackageSearch,
  Plus,
  ReceiptText,
  UserPlus,
  Wrench,
} from 'lucide-react';
import { hasPermission } from '../../utils/permissions';

const actions = [
  ['New Customer', '/customers/new', UserPlus, 'customers.create'],
  ['New Job Card', '/jobs/new', Wrench, 'jobs.create'],
  ['Create Invoice', '/invoices/new', FileText, 'invoices.create'],
  ['Record Payment', '/payments/new', CreditCard, 'payments.create'],
  ['Add Expense', '/expenses/new', ReceiptText, 'expenses.create'],
  ['Stock Issue', '/stock/movements', PackageSearch, 'stock.create'],
  ['Add Vehicle', '/vehicles/new', Car, 'vehicles.create'],
  ['Service Catalog', '/services', Plus, 'services.view'],
];

export const QuickActionsPanel = ({ user, onNavigate }) => (
  <article className="dashboard-panel">
    <div className="panel-title"><h2>Quick Actions</h2><Wrench size={15} /></div>
    <div className="quick-actions quick-actions-expanded">
      {actions
        .filter(([, , , permission]) => hasPermission(user, permission))
        .map(([label, path, Icon]) => (
          <button key={label} type="button" onClick={() => onNavigate(path)}>
            <span className="quick-action-leading">
              <Icon size={12} />
              <span>{label}</span>
            </span>
            <ArrowRight size={12} />
          </button>
        ))}
    </div>
  </article>
);
