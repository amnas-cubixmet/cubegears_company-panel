import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const file = (path) => readFileSync(new URL('../' + path, import.meta.url), 'utf8');

test('server entitlements are loaded and invalid responses fail closed', () => {
  const source = file('src/context/FeatureAccessContext.jsx');
  assert.match(source, /apiClient\.get\('\/saas\/credits\/entitlements'\)/);
  assert.match(source, /const LOCKED = Object\.freeze\(\{ enforced: true, modules: \[\]/);
  assert.match(source, /cubegear:credits-updated/);
  assert.doesNotMatch(source, /error\?\.status === 404/);
  assert.match(source, /setAccess\(LOCKED\)/);
  assert.match(source, /module === 'dashboard'\) return access\.modules\.length > 0/);
});

test('sidebar and mobile navigation filter modules by company entitlements', () => {
  for (const path of [
    'src/components/layout/Sidebar.jsx',
    'src/components/layout/MobileBottomNav.jsx',
    'src/components/layout/MobileSlideSidebar.jsx',
  ]) assert.match(file(path), /moduleIsVisible\(featureAccess, route\.permission\)/);
});

test('dashboard and protected routes cannot display inactive modules in strict mode', () => {
  assert.match(file('src/routes/ProtectedRoute.jsx'), /featureAccess\.modules\.length === 0/);
  assert.match(file('src/routes/ProtectedRoute.jsx'), /moduleIsVisible\(featureAccess, requiredPermission\)/);
  const dashboard = file('src/pages/dashboard/Dashboard.jsx');
  assert.match(dashboard, /featureAccess\.enforced/);
  assert.match(dashboard, /featureAccess\.modules\.includes/);
  assert.match(dashboard, /hasPermission\(user, route\.permission\)/);
});

test('feature activation remains server-validated', () => {
  const source = file('src/pages/saas/CreditWorkspace.jsx');
  assert.match(source, /creditWalletService\.enableFeature\(feature\.key\)/);
  assert.match(source, /notifyCreditChange\(\)/);
});
