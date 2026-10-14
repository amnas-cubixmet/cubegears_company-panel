import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const routes = read('../src/routes/AppRoutes.jsx');
const wallet = read('../src/pages/saas/CreditWorkspace.jsx');
const header = read('../src/components/layout/Header.jsx');
const service = read('../src/services/creditWallet.service.js');
const guard = read('../src/routes/ProtectedRoute.jsx');

test('subscription paywall routes are replaced with five credit wallet tabs', () => {
  for (const path of ['/account/credits/buy', '/account/credits/features', '/account/storage',
                      '/account/credits/logs']) {
    assert.ok(routes.includes(path), 'Missing ' + path);
  }
  assert.match(routes, /path="\/account" element=\{<CreditWorkspace section="overview" \/>\}/);
  assert.doesNotMatch(guard, /billing\.required && !billing\.paid/);
  assert.doesNotMatch(routes, /<PlanMarketplace|<SubscriptionCheckout/);
});

test('credit wallet never fabricates balances or credits after payment', () => {
  assert.match(service, /\/saas\/credits\/overview/);
  assert.match(service, /\/saas\/credits\/orders/);
  assert.match(service, /\/saas\/credits\/verify/);
  assert.match(service, /!confirmed\?\.credited/);
  assert.match(wallet, /wallet\?\.balance/);
  assert.match(wallet, /No balance or payment has been assumed/);
  assert.match(wallet, /feature\.monthlyCredits/);
  assert.doesNotMatch(wallet, /localStorage\.setItem/);
});

test('wallet has server feature toggles, storage logs and responsive top bar', () => {
  assert.match(service, /\/saas\/credits\/features\/enable/);
  assert.match(service, /\/saas\/credits\/features\/disable/);
  assert.match(wallet, /\/account\/storage\/history/);
  assert.match(header, /<CreditBalanceChip/);
  assert.match(read('../src/styles/credit-wallet.css'), /@media\(max-width:700px\)/);
});
