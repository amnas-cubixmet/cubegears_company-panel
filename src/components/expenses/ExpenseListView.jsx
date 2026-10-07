import React from 'react';
import { Edit3, Eye, Layers3, Search, Trash2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { hasPermission } from '../../utils/permissions';

const statusClass=(status='')=>'is-'+String(status).toLowerCase().replace(/[^a-z0-9]+/g,'-');

export const ExpenseListView=({expenses,query,onQueryChange,categoryFilter,onCategoryChange,statusFilter,onStatusChange,categories,formatMoney,onView,onEdit,onDelete})=>{
 const {user}=useAuth(); const canEdit=hasPermission(user,'expenses.edit'); const canDelete=hasPermission(user,'expenses.delete');
 return <>
  <section className="expense-dashboard-toolbar">
    <label className="expense-dashboard-search"><Search size={14}/><input value={query} onChange={e=>onQueryChange(e.target.value)} placeholder="Search expense, vendor, ID, reference or payment method"/></label>
    <select value={categoryFilter} onChange={e=>onCategoryChange(e.target.value)}><option>All</option>{categories.map(c=><option key={c}>{c}</option>)}</select>
    <select value={statusFilter} onChange={e=>onStatusChange(e.target.value)}><option>All</option><option>Approved</option><option>Pending Approval</option><option>Draft</option><option>Rejected</option></select>
  </section>
  <div className="expense-card-grid">{expenses.map(expense=><article key={expense.id} className="expense-card">
    <div className="expense-card__head"><div><span>{expense.id}</span><strong>{expense.title}</strong></div><b className={'expense-status '+statusClass(expense.status)}>{expense.status}</b></div>
    <div className="expense-category-chip"><Layers3 size={12}/>{expense.category}</div>
    <div className="expense-card-values"><div><span>Amount</span><strong>{formatMoney(expense.amount)}</strong></div><div><span>Date</span><strong>{expense.expenseDate}</strong></div><div><span>Payment</span><strong>{expense.paymentMethod}</strong></div></div>
    <div className="expense-vendor"><span>Vendor / Payable To</span><strong>{expense.vendor}</strong></div>
    <div className="expense-card-actions"><button onClick={()=>onView(expense)}><Eye size={13}/>View</button>{canEdit&&<button onClick={()=>onEdit(expense)}><Edit3 size={13}/>Edit</button>}{canDelete&&<button className="is-danger" onClick={()=>onDelete(expense)}><Trash2 size={13}/>Delete</button>}</div>
  </article>)}</div>
  {!expenses.length&&<div className="expense-empty">No expenses matched your filters.</div>}
 </>;
};