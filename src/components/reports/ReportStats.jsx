import React from 'react';
import { BarChart3, IndianRupee, Package, ReceiptText, WalletCards } from 'lucide-react';

export const ReportStats=({report,formatMoney})=>{
 const cards=[
  ['Sales',formatMoney(report.sales),report.invoiceRows.length+' invoices',ReceiptText],
  ['Collected',formatMoney(report.collected),report.paymentRows.length+' payments',WalletCards],
  ['Expenses',formatMoney(report.expenseTotal),report.expenseRows.length+' expenses',IndianRupee],
  ['Net Cash',formatMoney(report.netCash),'Collections − expenses',BarChart3],
  ['Outstanding',formatMoney(report.outstanding),'Invoice balance',ReceiptText],
  ['Stock Value',formatMoney(report.stockValue),report.lowStock.length+' low-stock items',Package],
 ];
 return <section className="reports-dashboard-stats">{cards.map(([label,value,note,Icon])=><article key={label}><div><span>{label}</span><strong>{value}</strong><small>{note}</small></div><i><Icon size={15}/></i></article>)}</section>;
};