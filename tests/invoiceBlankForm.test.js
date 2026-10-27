import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const invoice = read('src/pages/invoices/InvoiceRoutePage.jsx');
const billing = read('src/services/billing.service.js');

test('new invoices and estimates request an empty form while edit keeps saved data', () => {
  assert.match(invoice, /blankBillingDocument\(kindFromUrl, \{ emptyInputs: mode === 'create' \}\)/);
  assert.match(invoice, /setForm\(blankBillingDocument\(kindFromUrl, \{ emptyInputs: true \}\)\)/);
  assert.match(invoice, /else setForm\(JSON\.parse\(JSON\.stringify\(doc\)\)\)/);
  assert.match(billing, /blankBillingDocument = \(kind = 'invoice', \{ emptyInputs = false \} = \{\}\)/);
});

test('date, sample seller name, amounts and invoice terms start blank for new documents', () => {
  assert.match(billing, /date: emptyInputs \? localInvoiceDate\(\) : today\(\)/);
  assert.match(billing, /name: emptyInputs \? '' : 'CubixGear Workshop'/);
  assert.match(billing, /discount: emptyInputs \? '' : 0/);
  assert.match(billing, /paymentMode: emptyInputs \? '' : 'Cash'/);
  assert.match(billing, /paymentType: emptyInputs \? '' : 'Credit'/);
  assert.match(billing, /paymentTerms: emptyInputs \? '' : 'C\.O\.D'/);
  assert.match(billing, /termsAndConditions: emptyInputs \? '' : 'Thank you for choosing CubixGear\.'/);
  assert.match(billing, /taxMode: emptyInputs \? '' : 'none'/);
  assert.match(billing, /cgstRate: emptyInputs \? '' : 9/);
  assert.match(billing, /sgstRate: emptyInputs \? '' : 9/);
  assert.match(billing, /igstRate: emptyInputs \? '' : 18/);
});

test('adding a line has no prefilled quantity, item type, unit, tax rate or discount', () => {
  assert.match(invoice, /const emptyItem = \(\) => \(\{[^\n]*type: '',[^\n]*qty: '', unit: '',[^\n]*taxRate: '', discount: ''/);
  assert.match(invoice, /<option value="">Select type<\/option>/);
  assert.match(invoice, /<option value="">Select unit<\/option>/);
  assert.match(invoice, /GST Type \(automatic\)/);
  assert.match(invoice, /<option value="">Select payment type<\/option>/);
  assert.match(invoice, /<option value="">Select payment mode<\/option>/);
  assert.match(invoice, /value=\{row\.unit \|\| ''\}/);
});

test('required date, item type and unit block incomplete manual invoices', () => {
  assert.match(invoice, /if \(!form\.date\) return 'Select an invoice date\.'/);
  assert.match(invoice, /if \(form\.items\.some\(\(row\) => !row\.type\)\)/);
  assert.match(invoice, /if \(form\.items\.some\(\(row\) => !row\.unit\)\)/);
});

test('real workshop profile and explicitly linked job-card data are not erased', () => {
  assert.match(invoice, /billingService\.getGstContext\(\)/);
  assert.match(invoice, /applyWorkshopTaxProfile\(/);
  assert.match(billing, /getJobInvoicePrefill\(\)/);
  assert.match(billing, /\.\.\.\(prefill\?\.customer \|\| \{\}\)/);
});
