
import { Plus } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { hasPermission } from '../../utils/permissions';

export const ExpensesHeader=({onAdd})=>{
  const {user}=useAuth();
  return <header className="expense-dashboard-header">
    <div><h1>Company Expenses</h1><p>Workshop operational costs, vendor bills, receipts and approvals.</p></div>
    <div className="expense-dashboard-header-actions">
      {hasPermission(user,'expenses.create')&&<button type="button" className="expense-primary-button" onClick={onAdd}><Plus size={16} aria-hidden="true"/> Add Expense</button>}
    </div>
  </header>;
};