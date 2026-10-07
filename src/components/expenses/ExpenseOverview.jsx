import React from 'react';
import { ReceiptText, Tags, Workflow } from 'lucide-react';

export const ExpenseOverview=({expenses,categoryTotals,formatMoney,onOpen})=><section className="expense-dashboard-bottom-grid">
  <article className="expense-dashboard-panel">
    <header className="expense-dashboard-panel-title"><div><h2>Recent Expenses</h2><p>Latest workshop operational spending.</p></div><ReceiptText size={15}/></header>
    <div className="expense-dashboard-row-list">{expenses.slice(0,6).map(expense=><button key={expense.id} onClick={()=>onOpen(expense)}><div><strong>{expense.title}</strong><span>{expense.expenseDate} · {expense.vendor}</span></div><b>{formatMoney(expense.amount)}</b></button>)}</div>
  </article>
  <article className="expense-dashboard-panel">
    <header className="expense-dashboard-panel-title"><div><h2>Top Categories</h2><p>Highest spending categories.</p></div><Tags size={15}/></header>
    <div className="expense-dashboard-row-list">{categoryTotals.slice(0,6).map((row,index)=><div key={row.category}><div><strong>#{index+1} {row.category}</strong><span>Expense category</span></div><b>{formatMoney(row.total)}</b></div>)}</div>
  </article>
  <article className="expense-dashboard-panel">
    <header className="expense-dashboard-panel-title"><div><h2>Expense Flow</h2><p>Standard accounting workflow.</p></div><Workflow size={15}/></header>
    <div className="expense-dashboard-flow"><span>Record Expense</span><span>Attach Receipt</span><span>Approval</span><span>Accounting Entry</span></div>
  </article>
</section>;
