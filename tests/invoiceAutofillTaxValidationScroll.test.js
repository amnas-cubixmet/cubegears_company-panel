import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  formatInvoicePlaceOfSupply, invoiceStateCode, workshopPlaceOfSupply,
  invoiceTaxMode, invoiceLineTaxChoices, localInvoiceDate,
} from '../src/utils/invoiceTaxUi.js';
import { validateInvoiceDraft } from '../src/utils/invoicePayload.js';

const read = (path) => readFileSync(new URL('../' + path, import.meta.url), 'utf8');

const draft = (registered = true) => ({
  date: '2026-10-27', invoiceType: registered ? 'gst' : 'regular',
  seller: { gstin: registered ? '32ABCDE1234F1Z5' : '', state: 'Kerala', stateCode: '32' },
  customer: { name: 'Customer', placeOfSupply: '32-Kerala' },
  items: [{ type: 'Labour', description: 'Service', hsnCode: '998729', qty: 1, unit: 'PCS', rate: 100, taxRate: '18', inventoryId: '' }],
  paid: '', discount: '', adjustment: '',
});

test('workshop state initializes place of supply and does not hardcode Kerala for other states', () => {
  assert.equal(workshopPlaceOfSupply({ companyState: 'Kerala', supplierState: '' }), '32-Kerala');
  assert.equal(workshopPlaceOfSupply({ companyState: 'Tamil Nadu', supplierState: '33' }), '33-Tamil Nadu');
  assert.equal(formatInvoicePlaceOfSupply('32'), '32-Kerala');
  assert.equal(formatInvoicePlaceOfSupply('West Bengal'), '19-West Bengal');
  assert.equal(invoiceStateCode('33-Tamil Nadu'), '33');
  assert.equal(invoiceStateCode('Unknown'), '');
});

test('date control defaults to local calendar day independent of UTC conversion', () => {
  assert.equal(localInvoiceDate(new Date(2026, 9, 27, 23, 50)), '2026-10-27');
  assert.equal(localInvoiceDate(new Date(2026, 0, 1, 0, 1)), '2026-01-01');
});

test('GST mode respects seller registration and place of supply', () => {
  const intrastate = draft();
  assert.equal(invoiceTaxMode(intrastate), 'cgst_sgst');
  const interstate = { ...intrastate, customer: { ...intrastate.customer, placeOfSupply: '33-Tamil Nadu' } };
  assert.equal(invoiceTaxMode(interstate), 'igst');
  assert.equal(invoiceTaxMode(draft(false)), 'none');
  assert.equal(invoiceTaxMode({ ...intrastate, customer: { name: 'x', placeOfSupply: 'invalid' } }), 'unknown');
});

test('GST options show requested CGST and SGST halves and IGST amounts correctly', () => {
  const pairs = invoiceLineTaxChoices('cgst_sgst');
  const five = pairs.find(x => x.value === '5');
  const ten = pairs.find(x => x.value === '10');
  const eighteen = pairs.find(x => x.value === '18');
  const thirtySix = pairs.find(x => x.value === '36');
  assert.match(five.label, /CGST 2.5% \+ SGST 2.5%/);
  assert.match(ten.label, /CGST 5% \+ SGST 5%/);
  assert.match(eighteen.label, /CGST 9% \+ SGST 9%/);
  assert.match(thirtySix.label, /CGST 18% \+ SGST 18%/);
  const igst = invoiceLineTaxChoices('igst');
  assert.ok(igst.some(x => x.value === '2.5' && x.label === 'IGST 2.5%'));
  assert.ok(igst.some(x => x.value === '9' && x.label === 'IGST 9%'));
  assert.ok(igst.some(x => x.value === '0'));
  assert.equal(invoiceLineTaxChoices('none').length, 0);
});

test('validation highlights exact missing date, location, item source and unit', () => {
  const missing = draft();
  missing.date = '';
  missing.customer.placeOfSupply = '';
  missing.items[0].type = '';
  missing.items[0].unit = '';
  const errors = validateInvoiceDraft(missing);
  assert.match(errors.date, /invoice date/);
  assert.match(errors['customer.placeOfSupply'], /state/);
  assert.match(errors['items.0.type'], /type/);
  assert.match(errors['items.0.unit'], /unit/);
});

test('seller profile inputs are read-only and Save scrolls to invalid input', () => {
  const editor = read('src/pages/invoices/InvoiceRoutePage.jsx');
  const seller = editor.slice(editor.indexOf('SELLER / FROM'), editor.indexOf('BILL TO'));
  assert.equal((seller.match(/readOnly aria-readonly="true"/g) || []).length, 7);
  assert.doesNotMatch(seller, /onChange=\{\(e\) => update\('seller\./);
  assert.match(editor, /placeOfSupply: old\.customer\?\.placeOfSupply \|\| workshopPlaceOfSupply\(context\)/);
  assert.match(editor, /scrollIntoView\(\{ behavior: 'smooth', block: 'center'/);
  assert.match(editor, /focus\(\{ preventScroll: true \}\)/);
  assert.match(editor, /aria-invalid=\{Boolean\(fieldErrors\.date\)\}/);
  assert.match(editor, /invoiceLineTaxChoices\(appliedTaxMode\)/);
});
