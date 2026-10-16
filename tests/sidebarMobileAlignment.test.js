import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const desktop = read('src/styles/desktop-typography.css');
const mobile = read('src/styles/workspace-responsive-polish.css');
const sidebar = read('src/components/layout/Sidebar.jsx');
const drawer = read('src/components/layout/MobileSlideSidebar.jsx');
const mobileHeader = read('src/components/layout/Header.jsx');
const mobileNav = read('src/components/layout/MobileBottomNav.jsx');

test('desktop sidebar reserves space for all 16px labels and section headings', () => {
  assert.match(desktop, /@media \(min-width: 1024px\)/);
  assert.match(desktop, /\.app-sidebar:not\(\.is-collapsed\)/);
  assert.match(desktop, /width: 284px/);
  assert.match(desktop, /min-width: 258px/);
  assert.match(desktop, /\.sidebar-nav-label\s*\{[^}]*white-space: normal/);
  assert.match(desktop, /\.sidebar-section-title\s*\{[^}]*white-space: normal/);
  assert.match(desktop, /\.sidebar-nav-item\s*\{[^}]*min-height: 46px/);
  assert.match(sidebar, /<span className="sidebar-nav-label">\{route.label\}<\/span>/);
  assert.match(sidebar, /route\.section === section/);
  assert.match(sidebar, /featureAccess\.can\(route\.permission\)/);
  assert.doesNotMatch(desktop, /\bzoom\s*:/);
});

test('narrow mobile header fits verified wallet, search, notification and profile buttons', () => {
  assert.match(mobileHeader, /<div className="mobile-header-row">/);
  assert.match(mobileHeader, /<CreditBalanceChip compact\s*\/>/);
  assert.match(mobileHeader, /className="mobile-header-actions"/);
  assert.match(mobile, /@media \(max-width: 390px\)/);
  assert.match(mobile, /\.mobile-header-actions \.cg-credit-chip\s*\{[^}]*max-width: 90px/);
  assert.match(mobile, /\.mobile-brand-copy small\s*\{\s*display: none/);
  assert.match(mobile, /:has\(\.mobile-notification-button\)/);
});

test('mobile More drawer preserves all authorized groups with readable, non-clipped text', () => {
  assert.match(mobile, /\.mobile-drawer-section-title\s*\{[^}]*white-space: normal/);
  assert.match(mobile, /\.mobile-drawer-item-label\s*\{[^}]*white-space: normal/);
  assert.match(mobile, /\.mobile-drawer-item-label\s*\{[^}]*overflow-wrap: break-word/);
  assert.match(drawer, /sections\.map\(\(section\)/);
  assert.match(drawer, /visibleRoutes\.filter\(\(route\) => route\.section === section\)/);
  assert.match(drawer, /featureAccess\.can\(route\.permission\)/);
  assert.match(mobileNav, /visiblePrimaryRoutes = primaryCandidates\.slice\(0, 4\)/);
  assert.match(mobileNav, /<MobileSlideSidebar/);
});
