import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { isInvoiceBranchStateMismatch } from '../src/utils/invoicePayload.js';

const read = (path) => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const page = read('src/pages/invoices/InvoiceRoutePage.jsx');
const layout = read('src/styles/invoice-goods-services-layout.css');

test('invoice removes redundant Company Settings and Place of Supply helper labels', () => {
  assert.match(page, /<label>GSTIN\s*\n/);
  assert.match(page, /<label>Place of Supply\s*\n/);
  assert.doesNotMatch(page, /GSTIN \(from Company Settings\)/);
  assert.doesNotMatch(page, /\(Auto-filled · Editable\)/);
  assert.doesNotMatch(page, /Auto-filled from Company Settings\. Change your business details/);
  assert.doesNotMatch(page, /GST invoice enabled by the verified workshop GSTIN in Company Settings/);
});

test('preview branch mismatch appears next to seller state, not as raw GST error', () => {
  const error = {
    status: 400,
    data: { gst: 'Workshop branch state differs from company GSTIN. Configure the supplying GST registration.' },
  };
  assert.equal(isInvoiceBranchStateMismatch(error), true);
  assert.equal(isInvoiceBranchStateMismatch({
    status: 400, data: { gst: ['Workshop branch state differs from company GSTIN.'] },
  }), true);
  assert.equal(isInvoiceBranchStateMismatch({
    status: 400, data: { gst: 'Select the legal place-of-supply state.' },
  }), false);
  assert.equal(isInvoiceBranchStateMismatch({status: 503, message:'Server unavailable'}), false);
  assert.match(page, /if \(isInvoiceBranchStateMismatch\(error\)\)/);
  assert.match(page, /setBranchStateMismatch\(true\)/);
  assert.match(page, /aria-invalid=\{branchStateMismatch\}/);
  assert.match(page, /Branch state and GSTIN state do not match/);
  assert.match(page, /setBackendPreviewError\(''\)/);
  assert.match(page, /setBranchStateMismatch\(false\)/);
});

test('Goods and Services adapts to the real panel width and never truncates type/unit selectors', () => {
  assert.match(page, /import '..\/..\/styles\/invoice-goods-services-layout\.css'/);
  assert.match(layout, /container: invoice-goods \/ inline-size/);
  assert.match(layout, /@container invoice-goods \(max-width: 1200px\)/);
  assert.match(layout, /@container invoice-goods \(max-width: 760px\)/);
  assert.match(layout, /grid-template-columns: repeat\(12, minmax\(0, 1fr\)\)/);
  assert.match(layout, /grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/);
  assert.match(layout, /minmax\(165px, \.7fr\) minmax\(0, 1\.8fr\)/);
  assert.match(layout, /height: 46px/);
  assert.match(layout, /\.invoice-mobile-label/);
  for (const field of ['invoice-hsn-field', 'invoice-qty-field', 'invoice-unit-field',
    'invoice-price-field', 'invoice-tax-field', 'invoice-item-amount']) {
    assert.match(layout, new RegExp(field));
  }
});
