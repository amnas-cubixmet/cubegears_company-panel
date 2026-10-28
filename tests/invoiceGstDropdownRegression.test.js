import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  workshopPlaceOfSupply, invoiceTaxMode,
  invoiceLineTaxChoices, formatInvoicePlaceOfSupply,
} from '../src/utils/invoiceTaxUi.js';
import { validateInvoiceDraft } from '../src/utils/invoicePayload.js';
import { applyWorkshopTaxProfile } from '../src/utils/invoiceTaxProfile.js';

const read = (path) => readFileSync(new URL('../' + path, import.meta.url), 'utf8');

const workshop = {
  registered: true, gstin: '32ABCDE1234F1Z5', companyName: 'Workshop',
  supplierState: '', companyState: '',
};
const draft = (pos = '') => ({
  date: '2026-10-27', kind: 'invoice', invoiceType: 'gst',
  seller: { name: 'Workshop', gstin: workshop.gstin, stateCode: '32' },
  customer: { name: 'Customer', placeOfSupply: pos },
  items: [{
    id: 'ROW-1', type: 'Service', description: 'Repair', hsnCode: '998729',
    qty: '1', rate: '100', unit: 'PCS', discount: '', taxRate: '18',
  }],
  paid: '', discount: '', adjustment: '',
});

test('GSTIN state prefix fills Place of Supply even when backend supplierState is omitted', () => {
  assert.equal(workshopPlaceOfSupply(workshop), '32-Kerala');
  assert.equal(formatInvoicePlaceOfSupply('Tamil Nadu'), '33-Tamil Nadu');
});

test('all ten GST component choices are available before choosing Place of Supply', () => {
  const current = draft('');
  assert.equal(invoiceTaxMode(current), 'cgst_sgst');
  const options = invoiceLineTaxChoices(invoiceTaxMode(current));
  assert.equal(options.length, 10);
  assert.ok(options.some(item => item.value === 'cgst:9' && item.label === 'CGST 9%'));
  assert.ok(options.some(item => item.value === 'sgst:9' && item.label === 'SGST 9%'));
  assert.ok(options.some(item => item.value === 'igst:18' && item.label === 'IGST 18%'));
  assert.equal(invoiceLineTaxChoices('unknown').length, 10);
});

test('the ten options remain visible when customer supply state is interstate', () => {
  const current = draft('33-Tamil Nadu');
  assert.equal(invoiceTaxMode(current), 'igst');
  const options = invoiceLineTaxChoices(invoiceTaxMode(current));
  assert.equal(options.length, 10);
  assert.ok(options.some(item => item.value === 'igst:5'));
  assert.ok(options.some(item => item.value === 'igst:18'));
});

test('an explicitly invalid customer state does not become a fabricated valid supply', () => {
  const current = draft('not a state');
  assert.equal(invoiceTaxMode(current), 'unknown');
  assert.ok(invoiceLineTaxChoices('unknown').length > 0);
  assert.match(validateInvoiceDraft(current)['customer.placeOfSupply'], /valid Place of Supply/);
});

test('valid customer Place of Supply does not get a false invalid-state error for missing workshop GST settings', () => {
  const missingWorkshop = draft('32-Kerala');
  missingWorkshop.seller = { gstin: '', state: '', stateCode: '' };
  const errors = validateInvoiceDraft(missingWorkshop);
  assert.equal(errors['customer.placeOfSupply'], undefined);
  assert.match(errors['seller.gstin'], /GSTIN and state in Company Settings/);
});

test('GST invoice still requires a legal explicit state before saving', () => {
  assert.match(validateInvoiceDraft(draft(''))['customer.placeOfSupply'], /before saving/);
  assert.equal(validateInvoiceDraft(draft('32-Kerala'))['customer.placeOfSupply'], undefined);
});

test('non-GST workshops remain non-taxable', () => {
  const prepared = applyWorkshopTaxProfile(draft('32-Kerala'), {
    registered: false, gstin: '', companyName: 'Unregistered',
  });
  assert.equal(prepared.invoiceType, 'regular');
  assert.equal(prepared.items[0].taxRate, 0);
  assert.equal(invoiceTaxMode(prepared), 'none');
  assert.equal(invoiceLineTaxChoices('none').length, 10);
});

test('invoice editor never disables GST rate dropdown to wait for Place of Supply', () => {
  const page = read('src/pages/invoices/InvoiceRoutePage.jsx');
  const service = read('src/services/billing.service.js');
  assert.doesNotMatch(page, /Select Place of Supply/);
  assert.doesNotMatch(page, /Select a valid state in Place of Supply to choose GST rates/);
  assert.doesNotMatch(page, /disabled=\{form\.invoiceType !== 'gst' \|\| appliedTaxMode === 'unknown'\}/);
  assert.match(page, /disabled=\{form\.invoiceType !== 'gst'\}/);
  assert.match(page, /GST · CGST \+ SGST/);
  assert.match(page, /GST · IGST/);
  assert.match(service, /const placeOfSupply = invoiceStateCode\(suppliedPlace\)/);
  assert.match(service, /doc\.customer\?\.state \|\| ''/);
});
