import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const form = readFileSync(new URL('../src/pages/invoices/InvoiceRoutePage.jsx', import.meta.url), 'utf8');
const preview = readFileSync(new URL('../src/services/billing.service.js', import.meta.url), 'utf8');

test('invoice type follows workshop GST status, not an editable tax toggle', () => {
  assert.match(form, /billingService\.getGstContext\(\)/);
  assert.match(form, /invoiceType: config\.invoiceType \|\| \(config\.registered \? 'gst' : 'regular'\)/);
  assert.match(form, /Company Invoice \(B2B\)/);
  assert.match(form, /Simple Service Bill \(B2C\)/);
  assert.match(form, /Invoice type must match the workshop GST registration/);
  assert.doesNotMatch(form, /onChange=\{\(e\) => update\('invoiceType', e\.target\.value\)\}/);
});

test('normal invoices do not show GST-only line inputs, tax fields or GSTIN', () => {
  assert.match(form, /form\.invoiceType === 'gst' && <input[^>]*aria-label="GST rate"/);
  assert.match(form, /form\.invoiceType === 'gst' && <input[^>]*aria-label="HSN or SAC"/);
  assert.match(form, /form\.invoiceType === 'gst' && <span>GST %<\/span>/);
  assert.match(form, /doc\.invoiceType === 'gst' && <span>GSTIN:/);
  assert.match(form, /doc\.invoiceType === 'gst' && taxGroups\.length > 0/);
  assert.match(form, /invoice-no-gst/);
});

test('non-GST invoice totals calculate zero taxes', () => {
  assert.match(preview, /registered: doc\.invoiceType === 'gst'/);
  assert.match(form, /form\.invoiceType === 'gst' && <>/);
});

test('GST invoices use classified item rates and select legal place of supply', () => {
  assert.match(form, /INDIA_STATES\.map/);
  assert.match(form, /className="invoice-tax-mode-note"/);
  assert.match(form, /if \(!form\.customer\?\.placeOfSupply\)/);
  assert.match(form, /String\(row\.taxRate \?\? ''\)\.trim\(\) === ''/);
  assert.match(form, /const current = await billingService\.saveDraft\(form\)/);
});

test('business vs personal bill is a recipient presentation choice, not a GST exemption', () => {
  assert.match(form, /aria-label="Bill customer type"/);
  assert.match(form, /Individual — Simple Service Bill/);
  assert.match(form, /Company — Business Invoice/);
  assert.match(form, /customerType: customer\.customerType \|\| customer\.customer_type/);
  assert.match(form, /isBusiness \? 'Invoice No\.' : 'Bill No\.'/);
  assert.match(form, /Service Bill \/ Tax Invoice/);
  assert.match(form, /Company GSTIN \(if registered\)/);
  assert.match(form, /doc\.invoiceType === 'gst' && taxGroups\.length > 0/);
});

test('business contact may be blank but company name is required', () => {
  assert.match(form, /Company name is required for B2B billing/);
  assert.match(form, /form\.customer\?\.customerType !== 'business'/);
});
