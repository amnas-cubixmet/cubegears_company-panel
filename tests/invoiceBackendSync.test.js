import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { normalizeBackendInvoiceTotals } from '../src/utils/invoiceBackendTotals.js';
import { calculateEstimateIndiaGst } from '../src/utils/indiaGst.js';
import { workshopPlaceOfSupply, invoiceTaxMode, formatInvoicePlaceOfSupply } from '../src/utils/invoiceTaxUi.js';

const read = (path) => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const calculateDocumentTotals = (doc) => {
  const gst = calculateEstimateIndiaGst({
    lines: doc.items.map((item) => ({
      type: item.type, quantity: Number(item.qty), unitPrice: Number(item.rate),
      taxRate: Number(item.taxRate),
    })),
    registered: doc.invoiceType === 'gst',
    supplierState: doc.seller.gstin.slice(0, 2),
    placeOfSupply: doc.customer.placeOfSupply.slice(0, 2),
  });
  return {
    itemSubtotal: gst.subtotal, documentDiscount: 0, adjustment: 0, paid: 0,
    taxable: gst.taxable, cgst: gst.cgst, sgst: gst.sgst, igst: gst.igst,
    tax: gst.tax, taxMode: gst.mode, total: gst.total, balance: gst.total,
    lineTotals: gst.taxRows.map((row) => ({
      taxable: row.taxable, gst: row.cgst + row.sgst + row.igst,
      total: row.taxable + row.cgst + row.sgst + row.igst,
    })),
  };
};

const invoice = (qty = 1, state = '32-Kerala') => ({
  kind: 'invoice', invoiceType: 'gst', date: '2026-10-27',
  seller: { gstin: '32ABCDE1234F1Z5', stateCode: '32' },
  customer: { name: 'Demo', placeOfSupply: state },
  items: [{ id: 'r1', type: 'Service', description: 'Service', qty, rate: 100,
    taxRate: 18, discount: '', unit: 'PCS', hsnCode: '998729' }],
  discount: '', adjustment: '', paid: '',
});

test('local invoice preview calculates qty multiplied by rupee unit rate plus percentage GST', () => {
  for (const [qty, result] of [[1, 118], [2, 236], [3, 354]]) {
    const totals = calculateDocumentTotals(invoice(qty));
    assert.equal(totals.taxMode, 'cgst_sgst');
    assert.equal(totals.lineTotals[0].taxable, qty * 100);
    assert.equal(totals.lineTotals[0].gst, qty * 18);
    assert.equal(totals.lineTotals[0].total, result);
    assert.equal(totals.total, result);
  }
});

test('backend decimal strings populate summary and item line amounts, not a stale client value', () => {
  const local = calculateDocumentTotals(invoice());
  const fromServer = {
    taxMode: 'cgst_sgst',
    itemSubtotal: '100.00', documentDiscount: '0.00', taxable: '100.00',
    cgst: '9.00', sgst: '9.00', igst: '0.00', tax: '18.00', adjustment: '0.00',
    total: '118.00', paid: '0.00', balance: '118.00',
    lineTotals: [{ taxable: '100.00', gst: '18.00', total: '118.00', cgst: '9.00', sgst: '9.00', igst: '0.00' }],
  };
  const result = normalizeBackendInvoiceTotals(fromServer, local);
  assert.equal(result.total, 118);
  assert.equal(result.balance, 118);
  assert.equal(result.lineTotals[0].total, 118);
  assert.equal(result.lineTotals[0].gst, 18);
  assert.equal(typeof result.total, 'number');
  assert.equal(normalizeBackendInvoiceTotals({ ...fromServer, lineTotals: [] }, local), null);
  assert.equal(normalizeBackendInvoiceTotals({ ...fromServer, total: 'NaN' }, local), null);
});

test('Place of Supply is workshop auto-filled but customer can edit and change tax mode', () => {
  const state = workshopPlaceOfSupply({ registered: true, gstin: '32ABCDE1234F1Z5', supplierState: '32' });
  assert.equal(state, '32-Kerala');
  assert.equal(invoiceTaxMode(invoice(1, state)), 'cgst_sgst');
  assert.equal(formatInvoicePlaceOfSupply('Tamil Nadu'), '33-Tamil Nadu');
  assert.equal(invoiceTaxMode(invoice(1, '33-Tamil Nadu')), 'igst');
});

test('invoice + estimate editor requests backend preview and marks state as editable', () => {
  const page = read('src/pages/invoices/InvoiceRoutePage.jsx');
  const service = read('src/services/billing.service.js');
  assert.match(page, /billingService\.previewTotals\(form\)/);
  assert.match(page, /setVerifiedTotals\(\{ fingerprint: previewFingerprint, data: response \}\)/);
  assert.match(page, /normalizeBackendInvoiceTotals\(fromBackend, localTotals\)/);
  assert.match(page, /Calculated by Django backend/);
  assert.match(page, /<label>Place of Supply/);
  assert.doesNotMatch(page, /Auto-filled · Editable/);
  assert.match(page, /onChange=\{\(e\) => update\('customer\.placeOfSupply', formatInvoicePlaceOfSupply\(e\.target\.value\)\)\}/);
  assert.match(service, /apiClient\.post\('\/billing\/documents\/preview'/);
  assert.match(service, /apiClient\.post\('\/billing\/documents'/);
});
