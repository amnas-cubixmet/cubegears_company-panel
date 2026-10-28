import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { calculateEstimateIndiaGst } from '../src/utils/indiaGst.js';

const read = (path) => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const page = read('src/pages/invoices/InvoiceRoutePage.jsx');
const css = read('src/styles/invoice-document-simplified.css');

test('New Invoice no longer renders Document Details panel or disabled invoice type', () => {
  for (const removed of [
    'INVOICE DETAILS', '<h3>Document Details</h3>',
    '<label>Invoice Type', '<label>Job Card No.', '<label>Staff / Advisor',
    'Normal Invoice — No GST', '<option value="gst">GST Tax Invoice',
  ]) {
    assert.ok(!page.includes(removed), removed + ' must not render');
  }
  assert.match(page, /className="invoice-source-grid invoice-source-grid--compact no-print"/);
  assert.match(page, /<section className="billing-card invoice-seller-card"/);
  assert.match(page, /<section className="billing-card invoice-customer-card"/);
});

test('Date and legal Place of Supply remain editable in Customer Details for GST invoices', () => {
  const sourceStart = page.indexOf('<section className="billing-card invoice-customer-card">');
  const afterCustomer = page.indexOf('<section className="billing-card no-print billing-items-card', sourceStart);
  const customer = page.slice(sourceStart, afterCustomer);
  assert.match(customer, /className="invoice-essential-fields"/);
  assert.match(customer, /<label>Invoice Date/);
  assert.match(customer, /type="date" value=\{form\.date \|\| ''\} required aria-invalid/);
  assert.match(customer, /onChange=\{\(e\) => update\('date', e\.target\.value\)\}/);
  assert.match(customer, /<label>Place of Supply/);
  assert.match(customer, /update\('customer\.placeOfSupply', formatInvoicePlaceOfSupply\(e\.target\.value\)\)/);
  assert.match(customer, /fieldErrors\['customer\.placeOfSupply'\]/);
  assert.match(css, /grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/);
  assert.match(css, /@media \(max-width: 850px\)/);
  assert.match(css, /@media \(max-width: 420px\)/);
  const gst = calculateEstimateIndiaGst({
    registered: true, supplierState: '32', placeOfSupply: '33',
    lines: [{ type: 'Service', quantity: 1, unitPrice: 100, taxRate: 18 }],
  });
  assert.equal(gst.igst, 18);
  assert.equal(gst.total, 118);
});

test('HSN / SAC has a short example placeholder; Unit dropdown uses clear labeled options', () => {
  assert.match(page, /aria-label="HSN or SAC code"/);
  assert.match(page, /placeholder="e\.g\. 998729"/);
  assert.match(page, /const unitOptions = \[/);
  for (const key of ['PCS', 'NOS', 'SET', 'KG', 'G', 'LTR', 'ML', 'MTR',
    'BOX', 'PACK', 'PAIR', 'HRS', 'MIN', 'DAY', 'JOB']) {
    assert.match(page, new RegExp("\\['" + key + "', '"));
  }
  assert.match(page, /<option value="">Select unit<\/option>/);
  assert.match(page, /unitOptions\.map\(\(\[value, label\]\) => <option key=\{value\} value=\{value\}>\{label\}<\/option>\)/);
  assert.match(page, /onChange=\{\(e\) => updateItem\(row\.id, 'unit', e\.target\.value\)\}/);
});

test('Existing invoice data and automatic invoice type remain in calculation/save logic', () => {
  const service = read('src/services/billing.service.js');
  const profile = read('src/utils/invoiceTaxProfile.js');
  assert.match(page, /applyWorkshopTaxProfile\(/);
  assert.match(page, /billingService\.saveDraft\(draft\)/);
  assert.match(page, /billingService\.previewTotals\(form\)/);
  assert.match(service, /jobCardNo: prefill\?\.jobNumber \|\| prefill\?\.jobId \|\| ''/);
  assert.match(profile, /workshopInvoiceType\(context\)/);
});
