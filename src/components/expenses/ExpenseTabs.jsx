import React from 'react';
import { BarChart3, Layers3, LayoutDashboard, ReceiptText } from 'lucide-react';

const tabs=[['overview','Overview',LayoutDashboard],['expenses','All Expenses',ReceiptText],['categories','Categories',Layers3],['reports','Reports',BarChart3]];
export const ExpenseTabs=({active,onChange})=><nav className="expense-dashboard-tabs">{tabs.map(([key,label,Icon])=><button key={key} className={active===key?'is-active':''} onClick={()=>onChange(key)}><Icon size={13}/>{label}</button>)}</nav>;
