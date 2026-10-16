import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const source = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');

test('calendar invoice is loaded from trusted backend, not mock browser amounts', () => {
  const service = source('src/services/creditWallet.service.js');
  const page = source('src/pages/saas/CreditWorkspace.jsx');
  assert.match(service, /calendarBilling: \(\) => apiClient\.get\('\/saas\/credits\/billing-cycle'\)/);
  assert.match(service, /retryCalendarBilling: \(\) => apiClient\.post\('\/saas\/credits\/billing-cycle', \{\}\)/);
  assert.match(page, /creditWalletService\.calendarBilling\(\)/);
  assert.match(page, /creditWalletService\.retryCalendarBilling\(\)/);
  assert.match(page, /await featureAccess\.refresh\(\)/);
});

test('owner sees statement, grace dates, zero credit policy and overdue access restriction', () => {
  const page = source('src/pages/saas/CreditWorkspace.jsx');
  assert.match(page, /calendarBilling\?\.enabled/);
  assert.match(page, /calendarBilling\.allowZeroBalanceUsage/);
  assert.match(page, /calendarBilling\.restricted/);
  assert.match(page, /calendarBilling\.statements \|\| \[\]/);
  assert.match(page, /calendarBilling\.dueDay/);
  assert.match(page, /navigate\('\/account\/credits\/buy'\)/);
  assert.match(page, /navigate\('\/account\/storage\/history'\)/);
});

test('UI never calculates or modifies platform-defined credits', () => {
  const page = source('src/pages/saas/CreditWorkspace.jsx');
  assert.match(page, /item\.featureCredits/);
  assert.match(page, /item\.storageCredits/);
  assert.match(page, /item\.totalCredits/);
  assert.doesNotMatch(page, /localStorage\.setItem\(['"]billing/);
});
