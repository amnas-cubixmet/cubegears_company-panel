import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { availableStock, stockHealthGroups, normalizeStockMovement } from '../src/utils/stockOverview.js';

test('available stock correctly accounts for reservations', () => {
  assert.equal(availableStock({ onHand: '12', reserved: '3' }), 9);
  assert.equal(availableStock({ available: '4.5', onHand: '99' }), 4.5);
});

test('low, out and healthy counts are mutually exclusive', () => {
  const groups = stockHealthGroups([
    { onHand: 10, reserved: 0, minimumStock: 5 },
    { onHand: 6, reserved: 3, minimumStock: 4 },
    { onHand: 3, reserved: 3, minimumStock: 1 },
    { onHand: 0, reserved: 0, minimumStock: 1 },
  ]);
  assert.equal(groups.healthyItems, 1);
  assert.equal(groups.lowItems.length, 1);
  assert.equal(groups.outItems.length, 2);
  assert.equal(groups.healthPercentage, 25);
  assert.equal(stockHealthGroups([]).healthPercentage, null);
});

test('Django movement shows real quantity, part name, reference and date', () => {
  const movement = normalizeStockMovement({
    id: '123', type: 'job_issue', partName: 'Front Brake Pad',
    sku: 'BRK01', quantity: '-2.00', reference: 'JOB-001',
    created_at: '2026-10-12T14:00:00+05:30',
  });
  assert.equal(movement.label, 'Job Card Issue');
  assert.equal(movement.partName, 'Front Brake Pad');
  assert.equal(movement.reference, 'JOB-001');
  assert.equal(movement.quantity, -2);
  assert.match(movement.dateLabel, /12 Oct 2026/);
});

test('mock stock in/out is normalized without undefined or NaN values', () => {
  const received = normalizeStockMovement({ type: 'Stock In', itemName: 'Oil', qtyIn: 10, qtyOut: 0 });
  const issued = normalizeStockMovement({ type: 'Job Issue', partName: 'Filter', qty: 3 });
  const missing = normalizeStockMovement({ type: 'opening' });
  assert.equal(received.quantity, 10);
  assert.equal(issued.quantity, -3);
  assert.equal(missing.quantity, null);
  assert.equal(missing.reference, '—');
});

test('overview keeps working navigation and mobile ledger layout', () => {
  const root = readFileSync(new URL('../src/components/stock/StockOverview.jsx', import.meta.url), 'utf8');
  const ledger = readFileSync(new URL('../src/components/stock/StockRecentMovementPanel.jsx', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../src/styles/stock-overview-ui.css', import.meta.url), 'utf8');
  assert.match(root, /onNavigate\('\/stock\/add'\)/);
  assert.match(root, /onNavigate\('\/stock'\)/);
  assert.match(ledger, /normalizeStockMovement/);
  assert.match(ledger, /data-label="Quantity"/);
  assert.match(css, /@media\(max-width:620px\)/);
});
