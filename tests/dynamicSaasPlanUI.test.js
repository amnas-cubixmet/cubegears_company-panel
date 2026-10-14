import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read = (p) => readFileSync(new URL(p, import.meta.url), 'utf8');
const account = read('../src/components/account/AccountHeader.jsx');
const routes = read('../src/routes/AppRoutes.jsx');
const wallet = read('../src/pages/saas/CreditWorkspace.jsx');

test('account replaces subscription plan cards with credit wallet modules', () => {
  assert.match(account, /Buy Credits/);
  assert.match(account, /Features/);
  assert.match(account, /Logs/);
  assert.doesNotMatch(account, /Compare Plans|Subscription/);
  assert.match(routes, /\/account\/credits\/buy/);
  assert.match(wallet, /monthlyCredits/);
});

test('inactive features cannot be billed by a fabricated frontend balance', () => {
  assert.match(wallet, /creditWalletService\.enableFeature/);
  assert.match(wallet, /creditWalletService\.disableFeature/);
  assert.match(wallet, /No balance or payment has been assumed/);
});
