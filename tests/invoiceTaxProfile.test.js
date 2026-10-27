import test from 'node:test';
import assert from 'node:assert/strict';
import { applyWorkshopTaxProfile, workshopInvoiceType } from '../src/utils/invoiceTaxProfile.js';
import { prepareInvoicePayloadForApi, normalizeHsnSacCode } from '../src/utils/invoicePayload.js';

const normalContext = {
  registered: false, gstin: '', companyName: 'Unregistered Workshop',
};
const gstContext = {
  registered: true, gstin: '32ABCDE1234F1Z5', companyName: 'Registered Workshop',
};
const draft = () => ({
  kind: 'invoice', invoiceType: 'gst', taxMode: 'igst', date: '2026-10-27',
  seller: { name: 'Workshop', gstin: 'FAKE', stateCode: '32', state: 'Kerala' },
  customer: { name: 'Walk-in', placeOfSupply: '32-Kerala' },
  paid: '', discount: '', adjustment: '',
  cgstRate: 9, sgstRate: 9, igstRate: 18,
  items: [{ id: '1', type: 'Labour', description: 'Service', hsnCode: '000123',
    qty: 1, unit: 'PCS', rate: 100, discount: 0, purchasePrice: 0,
    inventoryId: '', taxRate: 18 }],
});

test('unregistered company forces normal invoice, no GST and preserves original editable draft', () => {
  const input = draft();
  const prepared = applyWorkshopTaxProfile(input, normalContext);
  assert.equal(workshopInvoiceType(normalContext), 'regular');
  assert.equal(prepared.invoiceType, 'regular');
  assert.equal(prepared.taxMode, 'none');
  assert.equal(prepared.seller.gstin, '');
  assert.equal(prepared.items[0].taxRate, 0);
  assert.equal(input.invoiceType, 'gst');
  assert.equal(input.items[0].taxRate, 18);
  const payload = prepareInvoicePayloadForApi(prepared);
  assert.equal(payload.invoiceType, 'regular');
  assert.equal(payload.items[0].taxRate, '0');
});

test('registered workshop can issue GST invoice with server-owned identity', () => {
  const prepared = applyWorkshopTaxProfile(draft(), gstContext);
  assert.equal(prepared.invoiceType, 'gst');
  assert.equal(prepared.seller.gstin, gstContext.gstin);
  assert.equal(prepareInvoicePayloadForApi(prepared).items[0].hsnCode, '000123');
});

test('missing or inconsistent registration blocks save instead of guessing', () => {
  assert.throws(() => workshopInvoiceType(null), /could not be verified/i);
  assert.throws(() => workshopInvoiceType({ registered: false, gstin: '32ABCDE1234F1Z5' }), /inconsistent/i);
});

test('HSN / SAC accepts letters and digits while preserving leading zeroes', () => {
  assert.equal(normalizeHsnSacCode('00 123A-4'), '00123A4');
  assert.equal(normalizeHsnSacCode('000123'), '000123');
  assert.equal(normalizeHsnSacCode('sac12a34'), 'SAC12A34');
  assert.equal(normalizeHsnSacCode('0'.repeat(40)).length, 30);
  assert.equal(normalizeHsnSacCode(''), '');
  const input = draft();
  input.invoiceType = 'regular';
  input.items[0].hsnCode = '0A00123';
  assert.equal(prepareInvoicePayloadForApi(input).items[0].hsnCode, '0A00123');
});
