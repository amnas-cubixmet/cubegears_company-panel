import React, { useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  CalendarDays,
  Download,
  FileSpreadsheet,
  IndianRupee,
  Package,
  Printer,
  ReceiptText,
  RefreshCw,
  Search,
  WalletCards
} from 'lucide-react';
import { billingService, calculateDocumentTotals } from '../../services/billing.service';
import { expenseService } from '../../services/expense.service';
import { stockManagementService } from '../../services/stockManagement.service';
import { resourceConfigs } from '../operations/resourceConfigs';
import '../../styles/reports-dashboard.css';

const paymentService = resourceConfigs.payments.service;
const money = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 });
const shortMoney = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
const today = () => new Date().toISOString().slice(0, 10);
const monthStart = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
};

const inRange = (value, from, to) => {
  if (!value) return false;
  const date = String(value).slice(0, 10);
  return (!from || date >= from) && (!to || date <= to);
};

const csvEscape = (value) => {
  const text = String(value ?? '');
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

const Stat = ({ icon: Icon, label, value, note }) => (
  <article className="report-stat">
    <div className="report-stat-icon"><Icon size={17}/></div>
    <div><span>{label}</span><strong>{value}</strong>{note && <small>{note}</small>}</div>
  </article>
);

export function Reports() {
  const [tab, setTab] = useState('overview');
  const [from, setFrom] = useState(monthStart());
  const [to, setTo] = useState(today());
  const [query, setQuery] = useState('');
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [docs, paymentRows, expenseRows, stockRows] = await Promise.all([
        billingService.list(),
        paymentService.list(),
        expenseService.getExpenses(),
        stockManagementService.getItems()
      ]);
      setInvoices((Array.isArray(docs) ? docs : []).filter((row) => row.kind === 'invoice'));
      setPayments(Array.isArray(paymentRows) ? paymentRows : []);
      setExpenses(Array.isArray(expenseRows) ? expenseRows : []);
      setStock(Array.isArray(stockRows) ? stockRows : []);
    } catch (e) {
      setError(e?.message || 'Unable to load report data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const report = useMemo(() => {
    const invoiceRows = invoices.filter((row) => inRange(row.date, from, to));
    const paymentRows = payments.filter((row) => inRange(row.date || row.paymentDate, from, to));
    const expenseRows = expenses.filter((row) => inRange(row.expenseDate || row.date, from, to));

    const sales = invoiceRows.reduce((sum, row) => sum + calculateDocumentTotals(row).total, 0);
    const outstanding = invoiceRows.reduce((sum, row) => sum + calculateDocumentTotals(row).balance, 0);
    const collected = paymentRows
      .filter((row) => String(row.status || '').toLowerCase() === 'completed')
      .reduce((sum, row) => sum + Number(row.amount || 0), 0);
    const expenseTotal = expenseRows.reduce((sum, row) => sum + Number(row.amount || 0), 0);
    const stockValue = stock.reduce((sum, row) => sum + Number(row.onHand || 0) * Number(row.costPrice || 0), 0);
    const lowStock = stock.filter((row) => Number(row.onHand || 0) - Number(row.reserved || 0) <= Number(row.minimumStock || 0));

    const categoryMap = new Map();
    expenseRows.forEach((row) => {
      const key = row.category || 'Miscellaneous';
      categoryMap.set(key, (categoryMap.get(key) || 0) + Number(row.amount || 0));
    });

    return {
      invoiceRows,
      paymentRows,
      expenseRows,
      sales,
      outstanding,
      collected,
      expenseTotal,
      netCash: collected - expenseTotal,
      stockValue,
      lowStock,
      expenseCategories: Array.from(categoryMap.entries()).map(([category, total]) => ({ category, total })).sort((a, b) => b.total - a.total)
    };
  }, [invoices, payments, expenses, stock, from, to]);

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return report.invoiceRows;
    return report.invoiceRows.filter((row) =>
      [row.number, row.customer?.name, row.vehicle?.registration, row.status]
        .some((value) => String(value || '').toLowerCase().includes(q))
    );
  }, [report.invoiceRows, query]);

  const exportCsv = () => {
    const rows = [
      ['Invoice', 'Date', 'Customer', 'Vehicle', 'Status', 'Total', 'Balance'],
      ...filteredRows.map((row) => {
        const totals = calculateDocumentTotals(row);
        return [
          row.number || row.id,
          row.date || '',
          row.customer?.name || '',
          row.vehicle?.registration || '',
          row.status || '',
          totals.total,
          totals.balance
        ];
      })
    ];
    const csv = rows.map((row) => row.map(csvEscape).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `cubixgear-report-${from || 'all'}-${to || 'all'}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="reports-loading">Loading reports…</div>;

  return (
    <div className="reports-page">
      <header className="reports-head no-print">
        <div>
          <span className="reports-kicker">REPORTS & ANALYTICS</span>
          <h1>Business Reports</h1>
          <p>Sales, collections, expenses and stock performance in one place.</p>
        </div>
        <div className="reports-head-actions">
          <button className="report-btn secondary" onClick={load}><RefreshCw size={16}/>Refresh</button>
          <button className="report-btn secondary" onClick={exportCsv}><FileSpreadsheet size={16}/>CSV</button>
          <button className="report-btn secondary" onClick={() => window.print()}><Printer size={16}/>Print</button>
          <button className="report-btn" onClick={() => window.print()}><Download size={16}/>Download PDF</button>
        </div>
      </header>

      <section className="report-filter-bar no-print">
        <label><CalendarDays size={15}/><span>From</span><input type="date" value={from} onChange={(e) => setFrom(e.target.value)}/></label>
        <label><span>To</span><input type="date" value={to} onChange={(e) => setTo(e.target.value)}/></label>
        <button onClick={() => { setFrom(monthStart()); setTo(today()); }}>This Month</button>
        <button onClick={() => { setFrom(''); setTo(''); }}>All Time</button>
      </section>

      {error && <div className="reports-error no-print">{error}</div>}

      <div className="report-print-sheet">
        <div className="report-print-head">
          <div><span>CUBIXGEAR</span><h2>Business Report</h2><p>{from || 'Beginning'} — {to || 'Today'}</p></div>
          <div><strong>Generated</strong><span>{new Date().toLocaleString('en-IN')}</span></div>
        </div>

        <div className="report-stats-grid">
          <Stat icon={ReceiptText} label="Sales" value={shortMoney.format(report.sales)} note={`${report.invoiceRows.length} invoices`}/>
          <Stat icon={WalletCards} label="Collected" value={shortMoney.format(report.collected)} note={`${report.paymentRows.length} payments`}/>
          <Stat icon={IndianRupee} label="Expenses" value={shortMoney.format(report.expenseTotal)} note={`${report.expenseRows.length} expenses`}/>
          <Stat icon={BarChart3} label="Net Cash" value={shortMoney.format(report.netCash)} note="Collections − expenses"/>
          <Stat icon={ReceiptText} label="Outstanding" value={shortMoney.format(report.outstanding)} note="Invoice balance"/>
          <Stat icon={Package} label="Stock Value" value={shortMoney.format(report.stockValue)} note={`${report.lowStock.length} low-stock items`}/>
        </div>

        <nav className="reports-tabs no-print">
          {[
            ['overview','Overview'],
            ['sales','Sales'],
            ['payments','Payments'],
            ['expenses','Expenses'],
            ['stock','Stock']
          ].map(([key,label]) => <button key={key} className={tab===key?'active':''} onClick={()=>setTab(key)}>{label}</button>)}
        </nav>

        {(tab === 'overview' || tab === 'sales') && (
          <section className="report-panel">
            <div className="report-section-head">
              <div><span>SALES</span><h3>Invoice Report</h3></div>
              <label className="report-search no-print"><Search size={15}/><input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search invoice or customer…"/></label>
            </div>
            <div className="report-table-wrap">
              <table className="report-table">
                <thead><tr><th>Invoice</th><th>Date</th><th>Customer</th><th>Vehicle</th><th>Status</th><th>Total</th><th>Balance</th></tr></thead>
                <tbody>{filteredRows.map((row)=>{
                  const t=calculateDocumentTotals(row);
                  return <tr key={row.id}><td>{row.number||row.id}</td><td>{row.date||'—'}</td><td>{row.customer?.name||'—'}</td><td>{row.vehicle?.registration||'—'}</td><td>{row.status||'—'}</td><td>{money.format(t.total)}</td><td>{money.format(t.balance)}</td></tr>;
                })}</tbody>
              </table>
            </div>
          </section>
        )}

        {(tab === 'overview' || tab === 'payments') && (
          <section className="report-panel">
            <div className="report-section-head"><div><span>COLLECTIONS</span><h3>Payment Report</h3></div></div>
            <div className="report-table-wrap">
              <table className="report-table">
                <thead><tr><th>Receipt</th><th>Date</th><th>Customer</th><th>Invoice</th><th>Method</th><th>Status</th><th>Amount</th></tr></thead>
                <tbody>{report.paymentRows.map((row)=><tr key={row.id}><td>{row.receiptNo||row.id}</td><td>{row.date||row.paymentDate||'—'}</td><td>{row.customer||row.customerName||'—'}</td><td>{row.invoice||row.invoiceId||'—'}</td><td>{row.method||row.paymentMethod||'—'}</td><td>{row.status||'—'}</td><td>{money.format(row.amount||0)}</td></tr>)}</tbody>
              </table>
            </div>
          </section>
        )}

        {(tab === 'overview' || tab === 'expenses') && (
          <section className="report-panel">
            <div className="report-section-head"><div><span>EXPENSES</span><h3>Expense Report</h3></div></div>
            <div className="report-split">
              <div className="report-table-wrap">
                <table className="report-table">
                  <thead><tr><th>Date</th><th>Expense</th><th>Category</th><th>Vendor</th><th>Status</th><th>Amount</th></tr></thead>
                  <tbody>{report.expenseRows.map((row)=><tr key={row.id}><td>{row.expenseDate||row.date||'—'}</td><td>{row.title||'Expense'}</td><td>{row.category||'—'}</td><td>{row.vendor||'—'}</td><td>{row.status||'—'}</td><td>{money.format(row.amount||0)}</td></tr>)}</tbody>
                </table>
              </div>
              <div className="report-category-list">
                <h4>By Category</h4>
                {report.expenseCategories.map((row)=><div key={row.category}><span>{row.category}</span><strong>{money.format(row.total)}</strong></div>)}
              </div>
            </div>
          </section>
        )}

        {(tab === 'overview' || tab === 'stock') && (
          <section className="report-panel">
            <div className="report-section-head"><div><span>INVENTORY</span><h3>Stock Report</h3></div></div>
            <div className="report-table-wrap">
              <table className="report-table">
                <thead><tr><th>SKU</th><th>Item</th><th>Category</th><th>On Hand</th><th>Reserved</th><th>Available</th><th>Cost</th><th>Value</th></tr></thead>
                <tbody>{stock.map((row)=>{const available=Number(row.onHand||0)-Number(row.reserved||0);const value=Number(row.onHand||0)*Number(row.costPrice||0);return <tr key={row.id}><td>{row.sku||'—'}</td><td>{row.partName||row.name||'—'}</td><td>{row.category||'—'}</td><td>{row.onHand||0}</td><td>{row.reserved||0}</td><td>{available}</td><td>{money.format(row.costPrice||0)}</td><td>{money.format(value)}</td></tr>;})}</tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default Reports;
