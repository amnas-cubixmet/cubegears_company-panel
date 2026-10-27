import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL('../' + path, import.meta.url), 'utf8');

test('invoice list loads independently of paid Stock and Customers lookup endpoints', () => {
  const source = read('src/pages/invoices/InvoiceRoutePage.jsx');
  const loadList = source.slice(source.indexOf('const loadList ='), source.indexOf('const loadDocument ='));
  assert.match(loadList, /const docs = await billingService\.list\(\)/);
  assert.doesNotMatch(loadList, /Promise\.all\(\[/);
  assert.match(loadList, /if \(withReferences\) await loadReferences\(\)/);
  assert.match(source, /if \(mode === 'list'\) loadList\(\)/);
  assert.match(source, /loadList\(\{ withReferences: true \}\)/);
});

test('invoice edits fetch optional data only with tenant permissions', () => {
  const source = read('src/pages/invoices/InvoiceRoutePage.jsx');
  assert.match(source, /can\('stock\.view'\) \? billingService\.inventory\(\) : Promise\.resolve\(\[\]\)/);
  assert.match(source, /can\('customers\.view'\) \? customerService\.getCustomers\(/);
  assert.match(source, /Promise\.allSettled\(\[/);
  assert.match(source, /if \(mode === 'edit'\) await loadReferences\(\)/);
});

test('verified owner sees an actionable invoice entitlement explanation', () => {
  const source = read('src/pages/auth/AccessDenied.jsx');
  assert.match(source, /access\.isCompanyOwner && permission\.startsWith\('invoices\.'\)/);
  assert.match(source, /navigate\('\/account\/credits\/features'\)/);
  assert.match(source, /Check \/ Activate Invoice Module/);
});
