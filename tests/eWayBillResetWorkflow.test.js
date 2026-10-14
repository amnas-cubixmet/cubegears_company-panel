import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const service = readFileSync(new URL('../src/services/eWayBill.service.js', import.meta.url), 'utf8');
const page = readFileSync(new URL('../src/pages/invoices/EWayBillPage.jsx', import.meta.url), 'utf8');

test('local E-Way Bill is never fabricated or pre-seeded', () => {
  assert.match(service, /const seed = \[\];/);
  assert.match(service, /status: 'Ready for API'/);
  assert.ok(!service.includes('ewayBillNo: id('));
  assert.match(page, /NOT AN OFFICIAL E-WAY BILL/);
});

test('draft reset preserves saved data and uses confirmation', () => {
  assert.match(service, /export const resetEWayBillDraft/);
  assert.match(service, /\/reset-draft/);
  assert.match(page, /appConfirm\('Reset unsaved changes/);
  assert.match(page, /Reset Form/);
  assert.match(page, /Reset to Draft/);
});

test('never offer edit or delete on locally prepared or official bills', () => {
  assert.match(page, /row.status === 'Draft' && !row.ewayBillNo/);
  assert.match(service, /Only local drafts may be deleted/);
  assert.match(page, /form.status !== 'Draft'/);
});

test('prefill goods-specific HSN and per-line tax, not overall invoice rates', () => {
  assert.match(page, /hsnCode: item.hsnCode \|\| item.hsn_sac/);
  assert.match(page, /Number\(item.taxRate \|\| 0\) \/ 2/);
  assert.match(page, /place: invoice.customer\?\.city/);
  assert.match(page, /not official GST portal E-Way Bills/);
});
