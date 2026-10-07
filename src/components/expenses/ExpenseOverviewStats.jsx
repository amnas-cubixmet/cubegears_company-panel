import React from 'react';
import { AlertTriangle, Calendar, CheckCircle2, IndianRupee } from 'lucide-react';

export const ExpenseOverviewStats=({currentMonthTotal,approvedTotal,pendingCount,todayTotal,formatMoney})=>{
  const cards=[
    ['This Month',formatMoney(currentMonthTotal),'monthly spend',IndianRupee,'primary'],
    ['Approved',formatMoney(approvedTotal),'approved expenses',CheckCircle2,'success'],
    ['Pending Approval',pendingCount,'needs review',AlertTriangle,'warning'],
    ['Today',formatMoney(todayTotal),'today spend',Calendar,'primary'],
  ];
  return <section className="expense-dashboard-stats">{cards.map(([label,value,meta,Icon,tone])=>
    <article key={label} className="expense-dashboard-stat-card">
      <div className="expense-dashboard-stat-top"><div><span>{label}</span><strong>{value}</strong></div><i className={'is-'+tone}><Icon size={15}/></i></div>
      <small>{meta}</small>
    </article>
  )}</section>;
};