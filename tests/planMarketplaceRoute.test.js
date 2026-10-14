import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const routes = readFileSync(new URL('../src/routes/AppRoutes.jsx', import.meta.url), 'utf8');

test('retired marketplace and subscription URLs redirect to credits', () => {
  assert.match(routes, /path="\/account\/plans" element=\{<Navigate to="\/account\/credits\/features" replace \/>\}/);
  assert.match(routes, /path="\/plans" element=\{<Navigate to="\/account\/credits\/buy" replace \/>\}/);
  assert.match(routes, /path="\/subscribe" element=\{<Navigate to="\/account\/credits\/buy" replace \/>\}/);
  assert.doesNotMatch(routes, /<PlanMarketplace \/>|<SubscriptionCheckout \/>/);
});

test('wallet pages load under authenticated workspace', () => {
  assert.match(routes, /import \{ CreditWorkspace \}/);
  assert.match(routes, /section="features"/);
  assert.match(routes, /section="logs"/);
});
