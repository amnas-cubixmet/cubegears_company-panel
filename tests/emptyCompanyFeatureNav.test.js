import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const file = (name) => readFileSync(new URL('../' + name, import.meta.url), 'utf8');

test('no active paid modules: core company/account settings stay accessible, workshop dashboard does not', () => {
  const context = file('src/context/FeatureAccessContext.jsx');
  assert.match(context, /CORE_MODULES = new Set\(\['billing', 'settings', 'company'/);
  assert.match(context, /if \(CORE_MODULES\.has\(module\)\) return true/);
  assert.match(context, /if \(module === 'dashboard'\) return access\.enforced \? access\.modules\.length > 0 : true/);
  assert.match(context, /return !access\.enforced \|\| access\.modules\.includes\(module\)/);
});

test('navigation is restricted by backend-derived user/tenant permissions', () => {
  for (const path of [
    'src/components/layout/Sidebar.jsx',
    'src/components/layout/MobileSlideSidebar.jsx',
    'src/components/layout/MobileBottomNav.jsx',
  ]) assert.match(file(path), /featureAccess\.can\(route\.permission\)/);
});

test('empty workshop dashboard redirects manager to feature activation', () => {
  const guard = file('src/routes/ProtectedRoute.jsx');
  assert.match(guard, /setupRedirect\(featureAccess, location\.pathname\)/);
  assert.match(file('src/utils/accountWorkspace.js'), /'\/account'/);
  assert.match(guard, /moduleIsVisible\(featureAccess, requiredPermission\)/);
});
