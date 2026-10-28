import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { prepareInvoicePayloadForApi } from '../src/utils/invoicePayload.js';

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');

const example = (invoiceType, taxMode = '') => ({
  kind: 'invoice', invoiceType, taxMode, date: '2026-10-28',
  seller: {
    name: 'Demo Workshop', gstin: invoiceType === 'gst' ? '32ABCDE1234F1Z5' : '',
    state: 'Kerala', stateCode: '32',
  },
  customer: {
    name: 'Manual Customer', phone: '', gstin: '', state: '',
    placeOfSupply: '32-Kerala',
  },
  jobCardNo: '', staff: '',
  discount: '', adjustment: '', paid: '',
  cgstRate: '', sgstRate: '', igstRate: '',
  items: [{
    type: 'Service', description: 'Repair', unit: 'PCS',
    qty: '1', rate: '100', taxRate: invoiceType === 'gst' ? '18' : '0',
    hsnCode: invoiceType === 'gst' ? '998729' : '',
  }],
});

test('new GST invoice can save with blank taxMode without sending it to Django', () => {
  const draft = example('gst');
  const payload = prepareInvoicePayloadForApi(draft);
  assert.equal(Object.hasOwn(payload, 'taxMode'), false);
  assert.equal(payload.invoiceType, 'gst');
  assert.equal(payload.items[0].taxRate, '18');
  assert.equal(payload.customer.gstin, '');
  assert.equal(payload.customer.state, '');
  assert.equal(payload.jobCardNo, '');
  assert.equal(payload.staff, '');
  assert.equal(draft.taxMode, '');
});

test('client-supplied GST tax mode is always omitted even when nonblank', () => {
  for (const taxMode of ['igst', 'none', 'cgst_sgst']) {
    const payload = prepareInvoicePayloadForApi(example('gst', taxMode));
    assert.equal(Object.hasOwn(payload, 'taxMode'), false);
  }
  const normal = prepareInvoicePayloadForApi(example('regular', ''));
  assert.equal(Object.hasOwn(normal, 'taxMode'), false);
  assert.equal(normal.invoiceType, 'regular');
});

test('manually opened New Invoice ignores stale local Job Card prefills', () => {
  const billing = read('src/services/billing.service.js');
  const page = read('src/pages/invoices/InvoiceRoutePage.jsx');
  assert.match(billing, /linkedJobId = String\(jobId \|\| ''\)\.trim\(\)/);
  assert.match(billing, /!emptyInputs \|\| \(linkedJobId && String\(storedPrefill\.jobId\) === linkedJobId\)/);
  assert.match(billing, /jobCardNo: prefill\?\.jobNumber \|\| prefill\?\.jobId \|\| ''/);
  assert.match(billing, /staff: ''/);
  assert.match(billing, /gstin: '', state: '', stateCode: '', placeOfSupply: ''/);
  assert.match(page, /jobId: new URLSearchParams\(location\.search\)\.get\('jobId'\)/);
  assert.match(page, /value=\{form\.customer\?\.gstin \|\| ''\}/);
  assert.match(page, /value=\{form\.customer\?\.state \|\| ''\}/);
  assert.doesNotMatch(page, /placeholder="GSTIN \/ URP"/);
  assert.doesNotMatch(page, /placeholder="JOB-2048"/);
  assert.doesNotMatch(page, /<label>Invoice Type/);
  assert.doesNotMatch(page, /GST invoice enabled by the verified workshop GSTIN/);
  assert.doesNotMatch(page, /<label>Job Card No\./);
  assert.doesNotMatch(page, /<label>Staff \/ Advisor/);
});

test('existing company profile retains legal invoice type and authoritative backend totals', () => {
  const service = read('src/services/billing.service.js');
  assert.match(service, /apiClient\.post\('\/billing\/documents'/);
  assert.match(service, /prepareInvoicePayloadForApi\(payload\)/);
  assert.match(service, /apiClient\.post\('\/billing\/documents\/preview'/);
});
