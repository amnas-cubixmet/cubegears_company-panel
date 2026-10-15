import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (file) => readFileSync(new URL('../' + file, import.meta.url), 'utf8');

test('server entitlements must fail closed when API is unavailable', () => {
  const source = read('src/context/FeatureAccessContext.jsx');
  assert.match(source, /apiClient\.get\('\/saas\/credits\/access'\)/);
  assert.match(source, /setAccess\(LOCKED\)/);
  assert.doesNotMatch(source, /error\?\.status === 404/);
  assert.match(source, /module === 'dashboard'\) return access\.modules\.length > 0/);
});

test('dashboard shows only bought features and role-authorized modules', () => {
  const source = read('src/pages/dashboard/Dashboard.jsx');
  assert.match(source, /const can = \(permission\) => hasPermission\(user, permission\)/);
  assert.match(source, /featureAccess\.modules\.includes\(route\.permission\.split\('\.'\)\[0\]\)/);
  assert.match(source, /hasPermission\(user, route\.permission\)/);
  assert.match(read('src/routes/ProtectedRoute.jsx'), /featureAccess\.modules\.length === 0/);
});

test('monthly billing statements are backend driven and visible beside wallet logs', () => {
  const service = read('src/services/creditWallet.service.js');
  const ui = read('src/pages/saas/CreditWorkspace.jsx');
  assert.match(service, /monthlyStatements: \(\) => apiClient\.get\('\/saas\/credits\/monthly-statements'\)/);
  assert.match(ui, /creditWalletService\.monthlyStatements\(\)/);
  assert.match(ui, /Monthly usage statements/);
  assert.match(ui, /row\.featureCredits/);
  assert.match(ui, /row\.storageCredits/);
  assert.match(ui, /result\?\.billingMode === 'monthly_postpaid'/);
});
