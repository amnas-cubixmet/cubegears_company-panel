import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (file) => readFileSync(new URL(file, import.meta.url), 'utf8');
const eway = read('../src/pages/invoices/EWayBillPage.jsx');
const invoice = read('../src/pages/invoices/InvoiceRoutePage.jsx');
const tabs = read('../src/components/invoices/InvoiceTabs.jsx');
const header = read('../src/components/invoices/InvoiceListHeader.jsx');
const filters = read('../src/components/invoices/InvoiceFilterToolbar.jsx');
const records = read('../src/components/invoices/InvoiceRecordsPanel.jsx');
const style = read('../src/styles/billing-ui-unified.css');
const app = read('../src/App.jsx');

test('all three billing lists use the same navigation with active page semantics', () => {
  assert.match(tabs, /aria-current=\{activeTab === 'invoice'/);
  assert.match(tabs, /aria-current=\{activeTab === 'estimate'/);
  assert.match(tabs, /aria-current=\{activeTab === 'eway'/);
  assert.match(eway, /<InvoiceTabs\s+activeTab="eway"/);
  assert.match(invoice, /<InvoiceTabs\s+activeTab=\{activeTab\}/);
  assert.match(header, /activeTab === 'estimate' \? 'Estimates' : 'Invoices'/);
});

test('E-Way Bill list has real filters, dynamic totals, and no fabricated document data', () => {
  assert.match(eway, /const filteredRows = useMemo/);
  assert.match(eway, /listStatus !== 'All'/);
  assert.match(eway, /row\.from\?\.tradeName/);
  assert.match(eway, /row\.transport\?\.vehicleNo/);
  assert.match(eway, /calculateEWayTotals\(row\)\.totalValue/);
  assert.match(eway, /filteredRows\.map\(\(row\) =>/);
  assert.match(eway, /<InvoiceFilterToolbar/);
  assert.match(eway, /No E-Way Bills match these filters/);
  assert.match(eway, /An official E-Way Bill number must be issued by the authorized NIC\/GST system/);
});

test('Invoices and estimates keep their current billing, draft and PDF actions', () => {
  assert.match(invoice, /<InvoiceOverviewStats/);
  assert.match(invoice, /<InvoiceRecordsPanel/);
  assert.match(invoice, /billingService\.saveDraft/);
  assert.match(invoice, /downloadPdf\(form\)/);
  assert.match(records, /aria-label=\{\`View/);
  assert.match(records, /aria-label=\{\`Download PDF/);
});

test('Search is semantic and accessible on every billing list', () => {
  assert.match(filters, /type="search"/);
  assert.match(filters, /aria-label="Search billing records"/);
  assert.match(filters, /aria-label="Filter documents by status"/);
  assert.match(filters, /placeholder=\{placeholder\}/);
  assert.match(eway, /Search document, sender, recipient, GSTIN or vehicle/);
});

test('billing field UI is unified and print templates untouched', () => {
  assert.match(app, /import '\.\/styles\/billing-ui-unified\.css'/);
  assert.match(style, /@media screen/);
  assert.match(style, /\.invoice-dashboard-search input/);
  assert.match(style, /border:0!important/);
  assert.match(style, /font-weight:400!important/);
  assert.match(style, /grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.doesNotMatch(style, /\.invoice-print-sheet/);
  assert.doesNotMatch(style, /\.eway-print-sheet/);
});
