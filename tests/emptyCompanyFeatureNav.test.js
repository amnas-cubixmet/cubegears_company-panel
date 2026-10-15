import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const file = (name) => readFileSync(new URL('../' + name, import.meta.url), 'utf8');

test('when no paid modules are active, only billing/activation nav remains visible', () => {
  const context = file('src/context/FeatureAccessContext.jsx');
  assert.match(context, /if \(access\.modules\.length === 0\) return module === 'billing';/);
  assert.match(context, /if \(module === 'dashboard'\) return access\.modules\.length > 0/);
});

test('navigation surfaces use the same backend-authorized module gating', () => {
  for (const path of [
    'src/components/layout/Sidebar.jsx',
    'src/components/layout/MobileSlideSidebar.jsx',
    'src/components/layout/MobileBottomNav.jsx',
  ]) {
    assert.match(file(path), /moduleIsVisible\(featureAccess, route\.permission\)/);
  }
});

test('empty workshop dashboard redirects manager to feature activation', () => {
  const guard = file('src/routes/ProtectedRoute.jsx');
  assert.match(guard, /featureAccess\.modules\.length === 0/);
  assert.match(guard, /'\/account\/credits\/features'/);
  assert.match(guard, /moduleIsVisible\(featureAccess, requiredPermission\)/);
});
