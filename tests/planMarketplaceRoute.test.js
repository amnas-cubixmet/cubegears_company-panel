import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const routes = read('../src/routes/AppRoutes.jsx');
const page = read('../src/pages/saas/PlanMarketplace.jsx');

test('account plans route imports the defined marketplace component', () => {
  assert.match(page, /export function PlanMarketplace\s*\(/);
  assert.match(
    routes,
    /import\s*\{\s*PlanMarketplace\s*\}\s*from\s*['"]\.\.\/pages\/saas\/PlanMarketplace['"];?/
  );
  assert.match(routes, /path="\/account\/plans"\s+element=\{<PlanMarketplace\s*\/>\}/);
});

test('public subscription checkout route remains available', () => {
  assert.match(routes, /import\s*\{\s*SubscriptionCheckout\s*\}/);
  assert.match(routes, /path="\/plans"\s+element=\{<SubscriptionCheckout\s*\/>\}/);
});
