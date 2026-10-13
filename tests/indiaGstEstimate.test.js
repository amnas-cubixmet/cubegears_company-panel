import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { calculateEstimateIndiaGst, indiaTaxMode } from '../src/utils/indiaGst.js';

const lines = [
  { type: 'Labour', description: 'Repair service', quantity: '1', unitPrice: '1000', taxRate: '18' },
  { type: 'Part', description: 'Automotive part', quantity: '1', unitPrice: '500', taxRate: '18' },
];
const source = readFileSync(new URL('../src/components/jobs/QuickEstimatePanel.jsx', import.meta.url), 'utf8');
const billing = readFileSync(new URL('../src/pages/invoices/BillingWorkspace.jsx', import.meta.url), 'utf8');

test('same state uses CGST + SGST, never IGST', () => {
  const totals = calculateEstimateIndiaGst({
    lines, discount: 0, registered: true, supplierState: '32', placeOfSupply: '32',
  });
  assert.equal(totals.mode, 'cgst_sgst');
  assert.equal(totals.cgst, 135);
  assert.equal(totals.sgst, 135);
  assert.equal(totals.igst, 0);
  assert.equal(totals.total, 1770);
});

test('different states use IGST and discounts reduce taxable value', () => {
  const totals = calculateEstimateIndiaGst({
    lines, discount: 150, registered: true, supplierState: '32', placeOfSupply: '33',
  });
  assert.equal(totals.mode, 'igst');
  assert.equal(totals.taxable, 1350);
  assert.equal(totals.igst, 243);
  assert.equal(totals.total, 1593);
});

test('nonregistered supplier cannot charge GST in preview', () => {
  const totals = calculateEstimateIndiaGst({
    lines, discount: 0, registered: false, supplierState: '32', placeOfSupply: '33',
  });
  assert.equal(totals.mode, 'none');
  assert.equal(totals.tax, 0);
  assert.equal(totals.total, 1500);
  assert.equal(indiaTaxMode(true, '', ''), 'unknown');
});

test('estimate and invoice editor require classification and use POS not tax dropdown', () => {
  assert.match(source, /gst: \{ mode: registered \? 'gst' : 'non_gst', placeOfSupply \}/);
  assert.match(source, /HSN \/ SAC/);
  assert.match(source, /GST rate \(%\)/);
  assert.match(billing, /Place of Supply — State \/ UT/);
  assert.ok(!billing.includes('Tax Mode<select'));
  assert.match(billing, /Configure your valid workshop GSTIN/);
});
