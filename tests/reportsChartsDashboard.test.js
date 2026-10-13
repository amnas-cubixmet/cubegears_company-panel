import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  MONTHS, monthBounds, invoiceValue, scopedReportRows, aggregateReports,
  reportChartSeries, reportFilterOptions, moneyText,
} from '../src/pages/reports/reportAnalytics.js';

const file = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const page = file('../src/pages/reports/Reports.jsx');
const chart = file('../src/components/reports/ReportsCharts.jsx');
const filter = file('../src/components/reports/ReportPeriodFilter.jsx');
const styles = file('../src/styles/reports-analytics-ui.css');
const statuses = { invoices: true, payments: true, expenses: true, stock: true };

const fixture = {
  invoices: [
    { id: 'inv1', kind: 'invoice', status: 'Finalized', date: '2026-10-02',
      total: '1200.50', balance: '700.50', paid: '500', branch: 'Main', staff: 'Alice' },
    { id: 'inv2', kind: 'invoice', status: 'Paid', date: '2026-10-23',
      total: '2000', balance: '0', paid: '2000', branch: 'Main', staff: 'Alice' },
    { id: 'inv3', kind: 'invoice', status: 'Draft', date: '2026-10-08',
      total: '900', balance: '900', branch: 'Main', staff: 'Alice' },
    { id: 'inv4', kind: 'estimate', status: 'Finalized', date: '2026-10-08',
      total: '5000', balance: '5000', branch: 'Main', staff: 'Alice' },
    { id: 'inv5', kind: 'invoice', status: 'Paid', date: '2026-09-20',
      total: '700', balance: '0', branch: 'Main', staff: 'Alice' },
    { id: 'inv6', kind: 'invoice', status: 'Cancelled', date: '2026-10-09',
      total: '1000', balance: '1000', branch: 'Main', staff: 'Alice' },
  ],
  payments: [
    { id: 'p1', date: '2026-10-04', status: 'Completed', amount: '500', branch: 'Main', recordedBy: 'Alice' },
    { id: 'p2', date: '2026-10-11', status: 'Pending', amount: '50', branch: 'Main', recordedBy: 'Alice' },
    { id: 'p3', date: '2026-10-22', status: 'Completed', amount: '2000', branch: 'Main', recordedBy: 'Alice' },
  ],
  expenses: [
    { id: 'e1', date: '2026-10-05', status: 'Paid', amount: '350', category: 'Rent', branch: 'Main', created_by: 'Alice' },
    { id: 'e2', date: '2026-10-14', status: 'Paid', amount: '100', category: 'Utilities', branch: 'Main', created_by: 'Alice' },
  ],
  stock: [
    { id: 's1', onHand: '5', reserved: '1', costPrice: '100', minimumStock: '5', branch: 'Main' },
    { id: 's2', onHand: '2', reserved: '0', costPrice: '120', minimumStock: '1', branch: 'Main' },
  ],
};

test('October 2026 URL month/year resolves full October date range', () => {
  assert.equal(MONTHS[9], 'October');
  assert.deepEqual(monthBounds('October', '2026'), { from: '2026-10-01', to: '2026-10-31' });
  assert.deepEqual(monthBounds('February', '2028'), { from: '2028-02-01', to: '2028-02-29' });
  assert.equal(monthBounds('Invalid', '2026'), null);
});

test('Actual invoices, payments, expenses and current stock use correct fields', () => {
  const raw = scopedReportRows(fixture, '2026-10-01', '2026-10-31');
  assert.equal(raw.invoices.length, 2);
  const totals = aggregateReports(raw, statuses);
  assert.equal(totals.sales, 3200.5);
  assert.equal(totals.outstanding, 700.5);
  assert.equal(totals.collected, 2500);
  assert.equal(totals.expenseTotal, 450);
  assert.equal(totals.netCash, 2050);
  assert.equal(totals.stockValue, 740);
  assert.equal(totals.lowStock.length, 1);
  assert.deepEqual(totals.expenseCategories, [
    { category: 'Rent', total: 350 }, { category: 'Utilities', total: 100 },
  ]);
});

test('Report scope filters transactions, but staff never filters stock snapshot', () => {
  const onlyMain = scopedReportRows(fixture, '2026-10-01', '2026-10-31', 'Main', 'Alice');
  assert.equal(onlyMain.invoices.length, 2);
  assert.equal(onlyMain.stock.length, 2);
  const missingStaff = scopedReportRows(fixture, '2026-10-01', '2026-10-31', 'Main', 'Bob');
  assert.equal(missingStaff.invoices.length, 0);
  assert.equal(missingStaff.stock.length, 2);
  const options = reportFilterOptions(fixture);
  assert.ok(options.branches.includes('Main'));
  assert.ok(options.staff.includes('Alice'));
  assert.equal(options.branches[0], 'All');
});

test('Real chart buckets aggregate October by week, not invented data', () => {
  const raw = scopedReportRows(fixture, '2026-10-01', '2026-10-31');
  const buckets = reportChartSeries(raw, '2026-10-01', '2026-10-31');
  assert.equal(buckets.length, 5);
  assert.equal(buckets.reduce((s, r) => s + r.sales, 0), 3200.5);
  assert.equal(buckets.reduce((s, r) => s + r.collected, 0), 2500);
  assert.equal(buckets.reduce((s, r) => s + r.expenses, 0), 450);
  assert.equal(buckets.reduce((s, r) => s + r.net, 0), 2050);
  assert.deepEqual(reportChartSeries(raw, '2026-10-31', '2026-10-01'), []);
});

test('Missing endpoint must display unknown amount, not false ₹0', () => {
  const raw = scopedReportRows(fixture, '2026-10-01', '2026-10-31');
  const report = aggregateReports(raw, { invoices: false, payments: true, expenses: false, stock: true });
  assert.equal(report.sales, null);
  assert.equal(report.outstanding, null);
  assert.equal(report.collected, 2500);
  assert.equal(report.expenseTotal, null);
  assert.equal(report.netCash, null);
  assert.equal(moneyText(null), '—');
  assert.equal(invoiceValue({ total: '100', paid: '20' }).balance, 80);
});

test('Reports UI includes URL-backed filters and three working charts', () => {
  assert.match(page, /useSearchParams\(\)/);
  assert.match(page, /monthBounds\(month, year\)/);
  assert.match(page, /scopedReportRows\(raw, from, to, branch, staff\)/);
  assert.match(page, /reportChartSeries\(rows, seriesBounds\.from, seriesBounds\.to\)/);
  assert.match(page, /<ReportsCharts/);
  assert.match(page, /Promise\.allSettled/);
  assert.match(page, /return .*<div className="reports-page reports-pro">/);
  assert.match(page, /formatMoney=\{moneyText\}/);
  assert.match(filter, /Report branch/);
  assert.match(filter, /Report staff/);
  assert.match(filter, /Report month/);
  assert.match(filter, /Report year/);
  assert.match(chart, /ReportBarChart/);
  assert.match(chart, /ReportCashFlowChart/);
  assert.match(chart, /ReportExpenseBreakdown/);
  assert.match(chart, /No chart data/);
});

test('Charts, stats, table and filters include mobile and print rules', () => {
  assert.match(styles, /@media\(max-width:520px\)/);
  assert.match(styles, /@media print/);
  assert.match(styles, /reports-charts-grid/);
  assert.match(styles, /report-bar-svg/);
  assert.match(styles, /report-chart-scroll/);
  assert.match(styles, /report-table-wrap/);
  assert.match(styles, /reports-dashboard-stats/);
});

test('CSV export honors current selected invoice filters and uses persisted amounts', () => {
  assert.match(page, /filteredInvoices\.map/);
  assert.match(page, /invoiceValue\(row\)/);
  assert.match(page, /csvEscape/);
  assert.match(page, /a\.download = 'cubixgear-invoices-'/);
  assert.match(page, /loaded\.invoices && !dateError/);
});


test('Branch / staff selector resolves real directory names instead of UUIDs', () => {
  const branchId = 'f8430b1e-c0c2-4752-89dc-3787695bb31a';
  const staffId = 'd3a8fc98-8f97-4908-b188-88f6081fff28';
  const directory = {
    branches: [{ id: branchId, name: 'Main Branch' }],
    staff: [{ id: staffId, name: 'Rahul Technician' }],
  };
  const raw = {
    invoices: [{ id: 'd1', kind: 'invoice', status: 'Finalized', date: '2026-10-02',
      total: '100', paid: '100', balance: '0', branch: branchId, staff: staffId }],
    payments: [], expenses: [], stock: [],
  };
  const opts = reportFilterOptions(raw, directory);
  assert.ok(opts.branches.includes('Main Branch'));
  assert.ok(opts.staff.includes('Rahul Technician'));
  assert.ok(!opts.branches.includes(branchId));
  assert.ok(!opts.staff.includes(staffId));
  assert.equal(scopedReportRows(raw, '2026-10-01', '2026-10-31', 'Main Branch',
    'Rahul Technician', directory).invoices.length, 1);
  assert.equal(scopedReportRows(raw, '2026-10-01', '2026-10-31', 'Main Branch',
    'Other Staff', directory).invoices.length, 0);
  assert.equal(reportFilterOptions(raw).branches.includes(branchId), false);
});
