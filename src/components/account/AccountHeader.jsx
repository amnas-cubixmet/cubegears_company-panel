import React from 'react';
import { FilePenLine, HardDrive, ReceiptText, Settings2, ShieldCheck } from 'lucide-react';

const tabs=[
 ['overview','Overview','/account',ReceiptText],
 ['billing','Billing','/account/billing',ReceiptText],
 ['storage','Storage','/account/storage',HardDrive],
 ['templates','Templates','/account/templates',FilePenLine],
 ['security','Security','/account/security',ShieldCheck],
 ['settings','Settings','/settings',Settings2],
];

export const AccountHeader=({title,subtitle,active,onNavigate,actions})=><>
  <header className="account-dashboard-header">
    <div><h1>{title}</h1><p>{subtitle}</p></div>
    {actions ? <div className="account-dashboard-actions">{actions}</div> : null}
  </header>
  <nav className="account-dashboard-tabs" aria-label="Account navigation">
    {tabs.map(([key,label,path,Icon])=><button
      type="button"
      key={key}
      className={active===key?'is-active':''}
      aria-current={active===key?'page':undefined}
      onClick={()=>onNavigate(path)}
    ><Icon size={15} aria-hidden="true"/>{label}</button>)}
  </nav>
</>;