import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const service = read('../src/services/creditWallet.service.js');
const page = read('../src/pages/saas/CreditWorkspace.jsx');

test('normal Buy Credits uses authenticated hosted payment-link creation', () => {
  assert.match(service, /createHostedCheckout:.*saas\/credits\/checkout-links/);
  assert.match(service, /hostedCheckoutStatus:.*checkout-links/);
  assert.match(service, /window\.location\.assign\(url\.href\)/);
  assert.match(service, /url\.protocol !== 'https:'/);
  assert.doesNotMatch(service, /RAZORPAY_KEY_SECRET|RAZORPAY_WEBHOOK_SECRET/);
});

test('customer frontend has no gateway-test button or test credentials', () => {
  assert.doesNotMatch(page, /Test API Connection|Razorpay test configuration|gatewayProbe/);
  assert.match(page, /purchaseCredits\(pack\.id\)/);
  assert.match(page, /Opening payment page/);
});

test('wallet confirmation is fetched from Django after Razorpay return', () => {
  assert.match(page, /credit_purchase/);
  assert.match(page, /creditWalletService\.hostedCheckoutStatus\(purchaseId\)/);
  assert.match(page, /payment\.credited === true && payment\.status === 'credited'/);
  assert.match(page, /notifyCreditChange\(\)/);
});
