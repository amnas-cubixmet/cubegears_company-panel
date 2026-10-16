import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL('../' + path, import.meta.url), 'utf8');

test('header does not request denied notifications on render, route change or events', () => {
  const source = read('src/components/layout/Header.jsx');
  assert.match(source, /const canViewNotifications = can\('notifications\.view'\)/);
  const guard = source.indexOf('if (!canViewNotifications) {');
  const fetch = source.indexOf('resourceConfigs.notifications.service.list()', guard);
  const listener = source.indexOf("window.addEventListener('storage', onStorage)", guard);
  assert.ok(guard > 0 && fetch > guard && listener > fetch, 'Guard before API and event subscriptions');
  assert.match(source, /if \(!canViewNotifications\) \{\s*setNotificationCount\(0\);\s*return undefined;/);
  assert.match(source, /\[location\.pathname, canViewNotifications\]/);
  assert.match(source, /\{canViewNotifications && \(/);
});

test('roles still use backend protections and owner-only edits', () => {
  const source = read('src/pages/staff-management/UserRoles.jsx');
  assert.match(source, /const \{ isCompanyOwner \} = useFeatureAccess\(\)/);
  assert.match(source, /if \(!isCompanyOwner \|\| saving \|\| role\.isProtected/);
  assert.match(source, /await roleService\.deleteRole\(role\.id\)/);
  assert.match(source, /await appConfirm/);
});
