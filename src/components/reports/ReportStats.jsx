import React from 'react';
import { Activity, IndianRupee, Package, ReceiptText, TrendingUp, WalletCards } from 'lucide-react';

export const ReportStats = ({ report, formatMoney }) => {
  const cards = [
    { label: 'Total Billed', value: report.sales, note: report.invoiceRows.length + ' invoices',
      Icon: ReceiptText, tone: 'blue' },
    { label: 'Collections', value: report.collected,
      note: report.paymentRows.length + ' payment records', Icon: WalletCards, tone: 'green' },
    { label: 'Expenses', value: report.expenseTotal,
      note: report.expenseRows.length + ' expenses', Icon: IndianRupee, tone: 'orange' },
    { label: 'Net Cash', value: report.netCash, note: 'Collections − expenses',
      Icon: Activity, tone: report.netCash < 0 ? 'danger' : 'blue' },
    { label: 'Outstanding', value: report.outstanding,
      note: 'Selected invoice balances', Icon: TrendingUp, tone: 'danger' },
    { label: 'Stock Value', value: report.stockValue,
      note: report.lowStock.length + ' low-stock items · current', Icon: Package, tone: 'neutral' },
  ];
  return <section className="reports-dashboard-stats" aria-label="Workshop report totals">
    {cards.map(({ label, value, note, Icon, tone }) =>
      <article key={label} className={'is-' + tone}>
        <div className="report-stat-text">
          <span>{label}</span>
          <strong title={formatMoney(value)}>{formatMoney(value)}</strong>
          <small>{note}</small>
        </div>
        <i aria-hidden="true"><Icon size={18}/></i>
      </article>)}
  </section>;
};
