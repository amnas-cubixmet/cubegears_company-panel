import React from 'react';
import { Plus, Receipt } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { hasPermission } from '../../utils/permissions';

export const ExpensesHeader=({onAdd})=>{
  const {user}=useAuth();
  return <header className="expense-dashboard-header">
    <div><h1>Company Expenses</h1><p>Workshop operational costs, vendor bills, receipts and approvals.</p></div>
    <div className="expense-dashboard-header-actions">
      <div className="expense-dashboard-header-badge"><Receipt size={13}/><span>Expense Control</span></div>
      {hasPermission(user,'expenses.create')&&<button className="expense-primary-button" onClick={onAdd}><Plus size={14}/>Add Expense</button>}
    </div>
  </header>;
};