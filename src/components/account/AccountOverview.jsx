import React from 'react';
import { CalendarDays, FilePenLine, HardDrive, ReceiptText, ShieldCheck, Users } from 'lucide-react';

export const AccountOverview=({billing,storage,formatMoney,formatDate,onNavigate})=>{
  const cards=[
    ['Current Plan',billing.plan.name,billing.plan.status,ReceiptText],
    ['Active Users',billing.usage.seatsUsed,billing.plan.includedSeats+' included',Users],
    ['Storage Used',storage.usedGb+' GB','usage-based billing',HardDrive],
    ['Next Billing',formatDate(new Date(billing.plan.nextBillingDate)),'subscription renewal',CalendarDays],
  ];
  const actions=[
    ['Billing & Plan','/account/billing',ReceiptText],
    ['Media Storage','/account/storage',HardDrive],
    ['PDF Templates','/account/templates',FilePenLine],
    ['Account Security','/account/security',ShieldCheck],
  ];
  return <div className="account-overview">
    <section className="account-overview-stats">{cards.map(([label,value,meta,Icon])=><article key={label}><div><span>{label}</span><strong>{value}</strong><small>{meta}</small></div><i><Icon size={15}/></i></article>)}</section>
    <section className="account-overview-grid">
      <article className="account-overview-panel">
        <header><div><h2>Subscription Summary</h2><p>Current company SaaS usage and billing.</p></div><ReceiptText size={15}/></header>
        <div className="account-overview-rows">
          <div><span>Base Plan</span><strong>{formatMoney(billing.plan.basePrice)}</strong></div>
          <div><span>Included Users</span><strong>{billing.plan.includedSeats}</strong></div>
          <div><span>Storage</span><strong>{storage.usedGb} GB</strong></div>
          <div><span>Status</span><strong>{billing.plan.status}</strong></div>
        </div>
      </article>
      <article className="account-overview-panel">
        <header><div><h2>Quick Actions</h2><p>Manage account configuration.</p></div><Users size={15}/></header>
        <div className="account-overview-actions">{actions.map(([label,path,Icon])=><button key={path} onClick={()=>onNavigate(path)}><span><Icon size={12}/>{label}</span><b>›</b></button>)}</div>
      </article>
    </section>
  </div>;
};