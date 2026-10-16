import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = (name) => readFileSync(new URL('../' + name, import.meta.url), 'utf8');

const protectedRoute = source('src/routes/ProtectedRoute.jsx');
const layout = source('src/components/layout/DashboardLayout.jsx');
const mobile = source('src/components/layout/MobileBottomNav.jsx');
const drawer = source('src/components/layout/MobileSlideSidebar.jsx');
const routing = source('src/routes/routeConfig.js');
const access = source('src/context/FeatureAccessContext.jsx');
const workspace = source('src/pages/saas/CreditWorkspace.jsx');

test('restores the commit-era unified dashboard UI across owner and workshop pages', () => {
  assert.match(protectedRoute, /if \(featureAccess\.billingStatus\?\.blocked && featureAccess\.isCompanyOwner\) return <SaaSAccountLayout>/);
  assert.match(protectedRoute, /return\s*\(\s*<DashboardLayout>/);
  assert.match(layout, /<Sidebar \/>/);
  assert.match(layout, /<Header \/>/);
  assert.match(layout, /<MobileBottomNav \/>/);
  assert.doesNotMatch(layout, /!isInvoiceWorkspace && <MobileBottomNav/);
});

test('current tenant and activated-label security guards remain in place', () => {
  for (const pattern of [
    /setupRedirect\(featureAccess, location\.pathname\)/,
    /featureAccess\.isCompanyOwner/,
    /moduleIsVisible\(featureAccess, requiredPermission\)/,
    /featureAccess\.can\(requiredPermission\)/,
    /missingJobAccess/,
    /featureAccess\.labelOnly/,
  ]) assert.match(protectedRoute, pattern);
  assert.match(access, /response\.activeLabelModules/);
  assert.match(access, /current\.permissions\.includes\(permission\)/);
  assert.match(workspace, /creditWalletService\.purchaseBundle/);
  assert.match(workspace, /notifyCreditChange\(\)/);
});

test('mobile nav shows owner Account plus only authorized modules and a More menu', () => {
  assert.match(mobile, /featureAccess\.isCompanyOwner/);
  assert.match(mobile, /featureAccess\.can\(ownerAccount\.permission\)/);
  assert.match(mobile, /mobilePrimaryRoutes\.filter\(\(route\) => featureAccess\.can\(route\.permission\)\)/);
  assert.match(mobile, /visiblePrimaryRoutes = primaryCandidates\.slice\(0, 4\)/);
  assert.match(mobile, /visibleMoreRoutes = routeConfig\.filter/);
  assert.match(mobile, /featureAccess\.can\(route\.permission\)/);
  assert.match(mobile, /route\.id !== 'credits' \|\| featureAccess\.isCompanyOwner/);
  assert.match(mobile, /<MobileSlideSidebar/);
  assert.match(mobile, /aria-expanded=\{isSidebarOpen\}/);
  assert.match(routing, /id: 'credits', label: 'SaaS Account'/);
});

test('More menu exposes authorized workshop links and core profile/shop actions', () => {
  assert.match(drawer, /visibleRoutes = routeConfig\.filter\(route => featureAccess\.can\(route\.permission\)/);
  assert.match(drawer, /visibleRoutes\.filter\(\(route\) => route\.section === section\)/);
  assert.match(drawer, /to="\/profile"/);
  assert.match(drawer, /featureAccess\.isCompanyOwner && <NavLink to="\/account\/company"/);
  assert.match(drawer, /onClick=\{onClose\}/);
});
