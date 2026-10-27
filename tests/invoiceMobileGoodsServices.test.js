import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { calculateEstimateIndiaGst } from '../src/utils/indiaGst.js';
import { invoiceLineTaxChoices, invoiceTaxMode } from '../src/utils/invoiceTaxUi.js';

const read = (path) => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const editor = read('src/pages/invoices/InvoiceRoutePage.jsx');
const css = read('src/styles/invoice-item-responsive.css');

test('invoice and estimate editors no longer show Vehicle / Transport section', () => {
  assert.doesNotMatch(editor, /<h3>Vehicle \/ Transport<\/h3>/);
  assert.doesNotMatch(editor, /className="billing-card invoice-transport-card"/);
  assert.doesNotMatch(editor, /getCustomerVehicles\(/);
  assert.match(editor, /Existing customer selected — billing details are filled automatically/);
});

test('saved historical vehicle details are displayed only when they exist', () => {
  assert.match(editor, /appearance\.customShowTransport !== false &&\s*\(doc\.transportation\?\.vehicleNo \|\| doc\.transportation\?\.transporterName \|\| doc\.vehicle\?\.registration\)/);
});

test('each item has a labeled mobile card with visible GST inclusive amount', () => {
  for (const marker of [
    'invoice-item-row-actions', 'invoice-mobile-item-number', 'invoice-item-main-cell',
    'invoice-item-type-field', 'invoice-item-name-field', 'invoice-hsn-field',
    'invoice-qty-field', 'invoice-unit-field', 'invoice-price-field',
    'invoice-tax-field', 'invoice-item-amount', 'invoice-mobile-tax-breakdown',
  ]) {
    assert.ok(editor.includes(marker), `missing ${marker}`);
  }
  assert.match(editor, /totals\.lineTotals\[index\]\?\.total \?\? lineAmount/);
  assert.match(editor, /totals\.lineTotals\[index\]\?\.gst/);
  assert.match(editor, /aria-label="GST rate"/);
  assert.match(editor, /onChange=\{\(e\) => updateItem\(row\.id, 'taxRate', e\.target\.value\)\}/);
});

test('mobile input cards have stacked labels and accessible touch sizes at phone widths', () => {
  assert.match(css, /@media \(max-width: 1100px\)/);
  assert.match(css, /@media \(max-width: 700px\)/);
  assert.match(css, /@media \(max-width: 420px\)/);
  assert.match(css, /grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/);
  assert.match(css, /min-height: 46px/);
  assert.match(css, /font-size: 16px/);
  assert.match(css, /\.invoice-mobile-label \{/);
  assert.match(editor, /import '..\/..\/styles\/invoice-item-responsive\.css'/);
  assert.match(editor, /No goods or services added/);
});

test('GST choice still updates the item tax and total for both invoice and estimate', () => {
  const gst = {
    invoiceType: 'gst', seller: { gstin: '32ABCDE1234F1Z5' },
    customer: { placeOfSupply: '32-Kerala' },
  };
  const mode = invoiceTaxMode(gst);
  assert.equal(mode, 'cgst_sgst');
  const options = invoiceLineTaxChoices(mode);
  assert.ok(options.some(x => x.value === '18' && x.label.includes('CGST 9% + SGST 9%')));
  for (const kind of ['invoice', 'estimate']) {
    assert.ok(kind);
    const totals = calculateEstimateIndiaGst({
      registered: true, supplierState: '32', placeOfSupply: '32',
      lines: [{ type: 'Service', quantity: 1, unitPrice: 100, taxRate: 18 }],
    });
    assert.equal(totals.taxable, 100);
    assert.equal(totals.cgst, 9);
    assert.equal(totals.sgst, 9);
    assert.equal(totals.total, 118);
  }
});
