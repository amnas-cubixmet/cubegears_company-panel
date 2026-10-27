import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (file) => readFileSync(new URL('../' + file, import.meta.url), 'utf8');

test('server entitlements must fail closed when API is unavailable', () => {
  const source = read('src/context/FeatureAccessContext.jsx');
  assert.match(source, /apiClient\.get\('\/saas\/credits\/access'\)/);
  assert.match(source, /setAccess\(\{ \.\.\.LOCKED, userKey \}\)/);
  assert.doesNotMatch(source, /error\?\.status === 404/);
  assert.match(source, /access\.freeModules\?\.includes\(module\)/);
  assert.match(source, /if \(module === 'dashboard'\) return access\.permissions\.includes\('dashboard\.view'\)/);
});

test('dashboard hides module shortcuts while authorized navigation filters roles', () => {
  const source = read('src/pages/dashboard/Dashboard.jsx');
  assert.doesNotMatch(source, /Your available modules|routeConfig\.filter/);
  assert.match(source, /can\('jobs\.view'\)/);
  assert.match(read('src/components/layout/Sidebar.jsx'), /featureAccess\.can\(route\.permission\)/);
  assert.match(read('src/routes/ProtectedRoute.jsx'), /setupRedirect\(featureAccess, location\.pathname\)/);
});

test('monthly billing statements remain backend driven beside wallet logs', () => {
  const service = read('src/services/creditWallet.service.js');
  const ui = read('src/pages/saas/CreditWorkspace.jsx');
  assert.match(service, /monthlyStatements: \(\) => apiClient\.get\('\/saas\/credits\/monthly-statements'\)/);
  assert.match(ui, /creditWalletService\.monthlyStatements\(\)/);
  assert.match(ui, /Monthly usage statements/);
  assert.match(ui, /row\.featureCredits/);
  assert.match(ui, /row\.storageCredits/);
  assert.match(ui, /result\?\.billingMode === 'monthly_postpaid'/);
});
