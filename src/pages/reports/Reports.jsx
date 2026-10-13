import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Search } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { billingService, calculateDocumentTotals } from '../../services/billing.service';
import { expenseService } from '../../services/expense.service';
import { stockCatalogService } from '../../services/stockCatalog.service';
import { resourceConfigs } from '../operations/resourceConfigs';
import {
  ReportPeriodFilter, ReportStats, ReportTabs, ReportsHeader,
} from '../../components/reports';
import { ReportsCharts } from '../../components/reports/ReportsCharts';
import {
  MONTHS, monthBounds, aggregateReports, scopedReportRows, reportChartSeries,
  reportFilterOptions, invoiceValue, moneyText,
} from './reportAnalytics.js';
import '../../styles/reports-dashboard.css';
import '../../styles/reports-analytics-ui.css';

const paymentService = resourceConfigs.payments.service;
const currency = new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2,
});
const money = (amount) => amount === null || amount === undefined ? '—' : currency.format(amount);
const currentMonth = () => MONTHS[new Date().getMonth()];
const currentYear = () => String(new Date().getFullYear());
const csvEscape = (value) => {
  const text = String(value ?? '');
  return /[",\n]/.test(text) ? '"' + text.replace(/"/g, '""') + '"' : text;
};
const listRows = (response) => Array.isArray(response) ? response :
  Array.isArray(response?.results) ? response.results : [];

const fallbackInvoiceTotals = (doc) => {
  // For legacy local mock documents with item rows, calculate once. Django
  // invoices have authoritative stored totals and do not use this fallback.
  if (doc.total !== undefined && doc.total !== null) return doc;
  if (!Array.isArray(doc.items) || !doc.items.length) return doc;
  const totals = calculateDocumentTotals(doc);
  return { ...doc, total: totals.total, balance: totals.balance };
};
const initialLoaded = { invoices: false, payments: false, expenses: false, stock: false };
const namedSource = { invoices: 'Invoices', payments: 'Payments', expenses: 'Expenses', stock: 'Stock' };

const EmptyRows = ({ colSpan, label }) => <tr><td className="report-table-empty" colSpan={colSpan}>{label}</td></tr>;

export function Reports() {
  const [params, setParams] = useSearchParams();
  const requestedMonth = params.get('month');
  const month = MONTHS.includes(requestedMonth) ? requestedMonth :
    (params.has('from') || params.has('to') || params.get('period') === 'all' ? '' : currentMonth());
  const year = params.get('year') || currentYear();
  const branch = params.get('branch') || 'All';
  const staff = params.get('staff') || 'All';
  const customRange = params.has('from') || params.has('to');
  const isAllTime = params.get('period') === 'all';
  const bounds = customRange
    ? { from: params.get('from') || '', to: params.get('to') || '' }
    : isAllTime ? { from: '', to: '' } : monthBounds(month, year) || { from: '', to: '' };
  const { from, to } = bounds;
  const dateError = from && to && from > to ? 'Start date must be on or before end date.' : '';

  const [tab, setTab] = useState('overview');
  const [query, setQuery] = useState('');
  const [raw, setRaw] = useState({ invoices: [], payments: [], expenses: [], stock: [] });
  const [loaded, setLoaded] = useState(initialLoaded);
  const [loading, setLoading] = useState(true);
  const [warnings, setWarnings] = useState([]);

  const changeParams = (changes) => {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '') next.delete(key);
      else next.set(key, String(value));
    });
    setParams(next, { replace: true });
  };
  const chooseMonth = (value) => {
    if (!value) return changeParams({ month: null, year: null, period: 'all', from: null, to: null });
    changeParams({ month: value, year, period: null, from: null, to: null });
  };
  const chooseYear = (value) => changeParams({
    month: month || currentMonth(), year: value, period: null, from: null, to: null,
  });
  const chooseCustom = (key, value) => changeParams({
    month: null, year: null, period: null, [key]: value,
  });
  const chooseThisMonth = () => changeParams({
    month: currentMonth(), year: currentYear(), period: null, from: null, to: null,
  });
  const chooseAllTime = () => changeParams({
    month: null, year: null, from: null, to: null, period: 'all',
  });

  const load = async () => {
    setLoading(true);
    const result = await Promise.allSettled([
      billingService.list(), paymentService.list(),
      expenseService.getExpenses(), stockCatalogService.getItems(),
    ]);
    const names = ['invoices', 'payments', 'expenses', 'stock'];
    const fresh = {};
    const availability = {};
    const issues = [];
    names.forEach((name, index) => {
      const state = result[index];
      availability[name] = state.status === 'fulfilled';
      fresh[name] = availability[name] ? listRows(state.value) : [];
      if (!availability[name]) {
        issues.push(namedSource[name] + ' could not be loaded.');
      }
    });
    fresh.invoices = fresh.invoices.filter((row) =>
      String(row.kind || 'invoice').toLowerCase() === 'invoice').map(fallbackInvoiceTotals);
    setRaw(fresh);
    setLoaded(availability);
    setWarnings(issues);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const options = useMemo(() => reportFilterOptions(raw), [raw]);
  const rows = useMemo(() => !dateError
    ? scopedReportRows(raw, from, to, branch, staff)
    : { invoices: [], payments: [], expenses: [], stock: [] },
    [raw, from, to, branch, staff, dateError]);
  const report = useMemo(() => aggregateReports(rows, loaded), [rows, loaded]);
  const seriesBounds = useMemo(() => {
    if (from && to) return { from, to };
    const dates = [...rows.invoices.map((r) => r.date || r.issueDate || r.issue_date),
      ...rows.payments.map((r) => r.date || r.paymentDate),
      ...rows.expenses.map((r) => r.date || r.expenseDate)].filter(Boolean).map((d) => String(d).slice(0, 10)).sort();
    return dates.length ? { from: dates[0], to: dates.at(-1) } : { from: '', to: '' };
  }, [rows, from, to]);
  const series = useMemo(() => reportChartSeries(rows, seriesBounds.from, seriesBounds.to),
    [rows, seriesBounds]);
  const filteredInvoices = useMemo(() => {
    const q = query.trim().toLowerCase();
    return !q ? rows.invoices : rows.invoices.filter((row) => [
      row.number, row.customer?.name, row.customerName, row.vehicle?.registration, row.status,
    ].some((value) => String(value || '').toLowerCase().includes(q)));
  }, [rows.invoices, query]);

  const exportCsv = () => {
    if (!loaded.invoices || dateError) return;
    const table = [
      ['Invoice', 'Date', 'Customer', 'Vehicle', 'Status', 'Total', 'Balance'],
      ...filteredInvoices.map((row) => {
        const values = invoiceValue(row);
        return [row.number || '', row.date || row.issueDate || '', row.customer?.name || row.customerName || '',
          row.vehicle?.registration || '', row.status || '',
          values.total ?? '', values.balance ?? ''];
      }),
    ];
    const csv = table.map((line) => line.map(csvEscape).join(',')).join('\r\n');
    const blob = new Blob(['\ufeff', csv], { type: 'text/csv;charset=utf-8' });
    const href = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = href;
    a.download = 'cubixgear-invoices-' + (from || 'all') + '-' + (to || 'all') + '.csv';
    document.body.appendChild(a); a.click(); a.remove();
    window.setTimeout(() => URL.revokeObjectURL(href), 1000);
  };

  return <div className="reports-page reports-pro">
    <ReportsHeader onRefresh={load} onCsv={exportCsv} onPrint={() => window.print()}
      loading={loading} canExport={loaded.invoices && !dateError}/>
    <ReportPeriodFilter
      month={month} year={year} branch={branch} staff={staff}
      from={from} to={to} scopeOptions={options}
      onMonth={chooseMonth} onYear={chooseYear}
      onBranch={(value) => changeParams({ branch: value })}
      onStaff={(value) => changeParams({ staff: value })}
      onFrom={(value) => chooseCustom('from', value)}
      onTo={(value) => chooseCustom('to', value)}
      onThisMonth={chooseThisMonth} onAllTime={chooseAllTime}
      isAllTime={isAllTime} dateError={dateError}
    />

    {warnings.length > 0 && <div className="reports-error no-print" role="status">
      <AlertCircle size={16} aria-hidden="true"/>
      <span>{warnings.join(' ')} Unavailable totals display as —, not ₹0.</span>
      <button type="button" onClick={load}>Retry</button>
    </div>}
    {loading && <div className="reports-loading" role="status">Refreshing real report data…</div>}

    {!dateError && <div className="report-print-sheet">
      <div className="report-print-head">
        <div><span>CUBIXGEAR · BUSINESS INTELLIGENCE</span><h2>Workshop Performance</h2>
          <p>{from || 'All time'} — {to || 'Today'} · Branch: {branch} · Staff: {staff}</p></div>
        <div><strong>Generated on</strong><span>{new Date().toLocaleString('en-IN')}</span></div>
      </div>
      <ReportStats report={report} formatMoney={moneyText}
        loaded={loaded} />
      <ReportTabs active={tab} onChange={setTab}/>

      <ReportsCharts series={series} categories={report.expenseCategories} available={loaded}
        tab={tab} from={seriesBounds.from} to={seriesBounds.to}/>

      {(tab === 'overview' || tab === 'sales') && (
        <section className="report-panel">
          <div className="report-section-head">
            <div><span>SALES PERFORMANCE</span><h3>Invoice Report</h3>
              <p>Only finalized, paid or outstanding invoices · {filteredInvoices.length} records</p>
            </div>
            <label className="report-search no-print"><Search size={16} aria-hidden="true"/>
              <input value={query} onChange={(e) => setQuery(e.target.value)}
                aria-label="Search invoices" placeholder="Search invoice, customer or status…"/>
            </label>
          </div>
          <div className="report-table-wrap">
            <table className="report-table">
              <thead><tr><th>Invoice</th><th>Date</th><th>Customer</th><th>Vehicle</th>
                <th>Status</th><th>Total</th><th>Balance</th></tr></thead>
              <tbody>{filteredInvoices.length ? filteredInvoices.map((row, index) => {
                const value = invoiceValue(row);
                return <tr key={row.id || index}>
                  <td><strong>{row.number || '—'}</strong></td>
                  <td>{row.date || row.issueDate || '—'}</td>
                  <td>{row.customer?.name || row.customerName || '—'}</td>
                  <td>{row.vehicle?.registration || '—'}</td>
                  <td><span className={'report-status is-' + String(row.status || '').toLowerCase().replace(/\s+/g, '-')}>{row.status || '—'}</span></td>
                  <td className="report-table-money">{money(value.total)}</td>
                  <td className="report-table-money">{money(value.balance)}</td>
                </tr>;
              }) : <EmptyRows colSpan={7} label={loaded.invoices
                ? 'No matching invoices for the selected filters.' : 'Invoice data unavailable.'}/>}</tbody>
            </table>
          </div>
        </section>
      )}

      {(tab === 'overview' || tab === 'payments') && (
        <section className="report-panel">
          <div className="report-section-head"><div><span>COLLECTIONS</span>
            <h3>Payments Report</h3><p>Recorded payments in this period</p></div></div>
          <div className="report-table-wrap">
            <table className="report-table">
              <thead><tr><th>Receipt</th><th>Date</th><th>Customer</th><th>Invoice</th>
                <th>Method</th><th>Status</th><th>Amount</th></tr></thead>
              <tbody>{report.paymentRows.length ? report.paymentRows.map((row, index) =>
                <tr key={row.id || index}>
                  <td>{row.receiptNo || '—'}</td><td>{row.date || row.paymentDate || '—'}</td>
                  <td>{typeof row.customer === 'object' ? (row.customer?.name || row.customerName || '—') : (row.customerName || row.customer || '—')}</td>
                  <td>{row.invoiceNo || (typeof row.invoice === 'object' ? row.invoice?.number : row.invoice) || '—'}</td>
                  <td>{row.method || row.paymentMethod || '—'}</td><td>{row.status || '—'}</td>
                  <td className="report-table-money">{money(Number(row.amount))}</td>
                </tr>
              ) : <EmptyRows colSpan={7} label={loaded.payments
                ? 'No payments for the selected period.' : 'Payment data unavailable.'}/>}</tbody>
            </table>
          </div>
        </section>
      )}

      {(tab === 'overview' || tab === 'expenses') && (
        <section className="report-panel">
          <div className="report-section-head"><div><span>EXPENSE BREAKDOWN</span>
            <h3>Expenses Report</h3><p>Recorded operating expenses</p></div></div>
          <div className="report-table-wrap">
            <table className="report-table">
              <thead><tr><th>Date</th><th>Description</th><th>Category</th><th>Vendor</th>
                <th>Status</th><th>Amount</th></tr></thead>
              <tbody>{report.expenseRows.length ? report.expenseRows.map((row, index) =>
                <tr key={row.id || index}>
                  <td>{row.date || row.expenseDate || '—'}</td>
                  <td>{row.description || row.title || '—'}</td>
                  <td>{row.category || '—'}</td><td>{row.vendor || '—'}</td>
                  <td>{row.status || '—'}</td>
                  <td className="report-table-money">{money(Number(row.amount))}</td>
                </tr>
              ) : <EmptyRows colSpan={6} label={loaded.expenses
                ? 'No expenses for the selected period.' : 'Expense data unavailable.'}/>}</tbody>
            </table>
          </div>
        </section>
      )}

      {(tab === 'overview' || tab === 'stock') && (
        <section className="report-panel">
          <div className="report-section-head"><div><span>CURRENT INVENTORY</span>
            <h3>Stock Valuation</h3><p>Live on-hand and current cost — not historical month-end value</p></div></div>
          <div className="report-table-wrap">
            <table className="report-table">
              <thead><tr><th>SKU</th><th>Item</th><th>Category</th><th>On Hand</th>
                <th>Reserved</th><th>Available</th><th>Cost</th><th>Value</th></tr></thead>
              <tbody>{report.stockRows.length ? report.stockRows.map((row, index) => {
                const onHand = Number(row.onHand);
                const reserved = Number(row.reserved || 0);
                const cost = Number(row.costPrice ?? row.cost_price);
                return <tr key={row.id || index}>
                  <td>{row.sku || '—'}</td><td><strong>{row.partName || row.name || '—'}</strong></td>
                  <td>{typeof row.category === 'object' ? (row.category?.name || '—') : (row.category || '—')}</td>
                  <td>{Number.isFinite(onHand) ? onHand : '—'}</td>
                  <td>{Number.isFinite(reserved) ? reserved : '—'}</td>
                  <td>{Number.isFinite(onHand) ? onHand - reserved : '—'}</td>
                  <td className="report-table-money">{Number.isFinite(cost) ? money(cost) : '—'}</td>
                  <td className="report-table-money">{Number.isFinite(onHand) && Number.isFinite(cost) ? money(onHand * cost) : '—'}</td>
                </tr>;
              }) : <EmptyRows colSpan={8} label={loaded.stock
                ? 'No stock records for the selected branch.' : 'Stock data unavailable.'}/>}</tbody>
            </table>
          </div>
        </section>
      )}
      <p className="report-source-note">Source: billing documents, payment records, expenses and current stock data. Net cash is not profit; outstanding reflects invoices dated in the selected period.</p>
    </div>}
  </div>;
}
export default Reports;
