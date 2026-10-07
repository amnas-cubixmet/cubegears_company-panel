import React from 'react';
import { BarChart3, IndianRupee, LayoutDashboard, Package, WalletCards } from 'lucide-react';
const tabs=[['overview','Overview',LayoutDashboard],['sales','Sales',BarChart3],['payments','Payments',WalletCards],['expenses','Expenses',IndianRupee],['stock','Stock',Package]];
export const ReportTabs=({active,onChange})=><nav className="reports-dashboard-tabs no-print">{tabs.map(([key,label,Icon])=><button key={key} className={active===key?'is-active':''} onClick={()=>onChange(key)}><Icon size={13}/>{label}</button>)}</nav>;