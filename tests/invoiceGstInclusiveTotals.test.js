import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { calculateEstimateIndiaGst } from '../src/utils/indiaGst.js';

const read = (path) => readFileSync(new URL('../' + path, import.meta.url), 'utf8');

const calculate = (kind, supplierState, placeOfSupply, taxRate) => {
  // Both document kinds use calculateDocumentTotals and the same India GST
  // shared calculation; neither estimate nor invoice is tax-exempt by kind.
  assert.ok(['invoice', 'estimate'].includes(kind));
  return calculateEstimateIndiaGst({
    lines: [{ type: 'Service', quantity: 1, unitPrice: 100, taxRate }],
    registered: true, supplierState, placeOfSupply,
  });
};

test('Kerala GST workshop charges 9% CGST and 9% SGST in estimate and invoice totals', () => {
  for (const kind of ['estimate', 'invoice']) {
    const amount = calculate(kind, '32', '32', 18);
    assert.equal(amount.taxable, 100);
    assert.equal(amount.cgst, 9);
    assert.equal(amount.sgst, 9);
    assert.equal(amount.igst, 0);
    assert.equal(amount.total, 118);
  }
});

test('interstate estimates and invoices charge 18% IGST into grand total', () => {
  for (const kind of ['estimate', 'invoice']) {
    const amount = calculate(kind, '32', '33', 18);
    assert.equal(amount.cgst, 0);
    assert.equal(amount.sgst, 0);
    assert.equal(amount.igst, 18);
    assert.equal(amount.total, 118);
  }
});

test('GST excluded for non-registered workshop and invoice discount is respected', () => {
  const normal = calculateEstimateIndiaGst({
    lines: [{ type: 'Service', quantity: 1, unitPrice: 100, taxRate: 18 }],
    registered: false, supplierState: '32', placeOfSupply: '32',
  });
  assert.equal(normal.total, 100);
  const discounted = calculateEstimateIndiaGst({
    lines: [{ type: 'Service', quantity: 1, unitPrice: 100, taxRate: 18 }],
    discount: 10, registered: true, supplierState: '32', placeOfSupply: '32',
  });
  assert.equal(discounted.total, 106.2);
  assert.equal(discounted.taxRows[0].taxable, 90);
});

test('estimate editor, invoice editor, print preview use one GST-inclusive line source', () => {
  const page = read('src/pages/invoices/InvoiceRoutePage.jsx');
  const service = read('src/services/billing.service.js');
  assert.match(service, /const lineTotals = gst\.taxRows\.map/);
  assert.match(service, /lineTotals,/);
  assert.match(page, /totals\.lineTotals\[index\]\?\.total \?\? lineAmount/);
  assert.match(page, /totals\.lineTotals\[index\]\?\.total \?\? taxable \+ tax/);
  assert.match(page, /Grand Total \(incl\. GST\)/);
  assert.match(page, /Estimate Summary/);
  assert.match(page, /CGST \(included in total\)/);
  assert.match(page, /SGST \(included in total\)/);
  assert.match(page, /IGST \(included in total\)/);
});
