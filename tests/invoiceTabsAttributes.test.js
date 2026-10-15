import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(
  new URL('../src/components/invoices/InvoiceTabs.jsx', import.meta.url), 'utf8',
);

test('InvoiceTabs has exactly one type attribute per button', () => {
  const matches = [...source.matchAll(/<button\b[\s\S]*?>/g)].map(([opening]) => opening);
  assert.equal(matches.length, 3, 'Invoices, Estimates and E-Way Bills tabs');
  for (const opening of matches) {
    const attrs = opening.match(/\btype\s*=\s*["'][^"']+["']/g) || [];
    assert.deepEqual(attrs, ['type="button"'], 'Duplicate or missing button type');
  }
});

test('invoice and estimate tab routing still work', () => {
  assert.match(source, /onClick=\{\(\) => onChange\('invoice'\)\}/);
  assert.match(source, /onClick=\{\(\) => onChange\('estimate'\)\}/);
  assert.match(source, /onClick=\{onEWayBills\}/);
});
