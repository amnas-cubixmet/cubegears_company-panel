import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL('../' + path, import.meta.url), 'utf8');

test('dashboard does not render the Your available modules section', () => {
  const dashboard = read('src/pages/dashboard/Dashboard.jsx');
  assert.doesNotMatch(dashboard, /Your available modules|Available company modules/);
  assert.doesNotMatch(dashboard, /routeConfig\.filter/);
  assert.match(dashboard, /<DashboardStats data=\{data\}/);
  assert.match(dashboard, /<ServiceOperations/);
  assert.match(dashboard, /<DashboardBottomGrid/);
  assert.match(dashboard, /can\('jobs\.view'\)/);
});

test('desktop sidebar never renders an image with an empty avatar src', () => {
  const sidebar = read('src/components/layout/Sidebar.jsx');
  assert.match(sidebar, /typeof user\?\.avatar === 'string' \? user\.avatar\.trim\(\) : ''/);
  assert.match(sidebar, /avatarSrc\s*\?\s*<img src=\{avatarSrc\}/);
  assert.match(sidebar, /sidebar-user-avatar-fallback/);
  assert.doesNotMatch(sidebar, /<img src=\{user\?\.avatar\}/);
});

test('mobile sidebar uses initials avatar fallback when no URL exists', () => {
  const mobile = read('src/components/layout/MobileSlideSidebar.jsx');
  assert.match(mobile, /avatarSrc\s*\?\s*<img src=\{avatarSrc\}/);
  assert.match(mobile, /mobile-drawer-user-avatar-fallback/);
  assert.doesNotMatch(mobile, /<img src=\{user\?\.avatar\}/);
});

test('desktop and mobile header profiles use normalized avatar src only', () => {
  const header = read('src/components/layout/Header.jsx');
  assert.match(header, /const avatarSrc = typeof user\?\.avatar === 'string'/);
  assert.equal((header.match(/\{avatarSrc \? \(/g) || []).length, 2);
  assert.doesNotMatch(header, /src=\{user\.avatar\}/);
});
