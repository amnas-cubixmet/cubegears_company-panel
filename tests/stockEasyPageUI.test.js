import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const page = readFileSync(new URL('../src/pages/stock/StockEasyPage.jsx', import.meta.url), 'utf8');
const routes = readFileSync(new URL('../src/routes/AppRoutes.jsx', import.meta.url), 'utf8');

test('/stock opens the quick stock page rather than redirecting', () => {
  assert.match(routes, /path="\/stock" element={<StockEasyPage \/>}/);
});

test('easy stock searches real inventory and keeps Job Card parts linked', () => {
  assert.match(page, /stockCatalogService\.getItems\(\)/);
  assert.match(page, /stockCatalogService\.getStockDashboard\(\)/);
  assert.match(page, /Search part name, SKU, barcode or brand/);
  assert.match(page, /to="\/jobs"/);
  assert.match(page, /issue parts from the Job Card/);
});

test('stock receiving and internal consumption use backend workflow methods', () => {
  assert.match(page, /stockCatalogService\.stockIn\(payload\)/);
  assert.match(page, /stockCatalogService\.stockOut\(payload\)/);
  assert.match(page, /Stock History/);
  assert.match(page, /Number\.isFinite\(quantity\)/);
});

test('new parts start with zero quantity and are received separately', () => {
  assert.match(page, /onHand: 0, reserved: 0/);
  assert.match(page, /beginMove\('in', created\.id\)/);
});

test('advanced stock management is removed from all navigation', () => {
  assert.doesNotMatch(page, /Advanced stock management|\/stock\/overview|\/stock\/items|\/stock\/movements/);
  assert.match(routes, /path="\/stock\/\*" element={<Navigate to="\/stock" replace \/>}/);
  assert.doesNotMatch(routes, /<StockManagement |<AddStockItem/);
  assert.match(page, /href="#stock-history"/);
});
