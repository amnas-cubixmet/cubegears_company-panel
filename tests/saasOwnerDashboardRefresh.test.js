import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = (path) => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const layout = source('src/components/layout/SaaSAccountLayout.jsx');
const styles = source('src/styles/saas-owner-dashboard-refresh.css');
const account = source('src/components/account/AccountHeader.jsx');
const wallet = source('src/pages/saas/CreditWorkspace.jsx');
const access = source('src/context/FeatureAccessContext.jsx');

test('owner shell loads a theme-aware, full-width dashboard instead of a 1270px centered canvas', () => {
  assert.match(layout, /saas-owner-dashboard-refresh\.css/);
  assert.match(styles, /\.saas-account-shell \.saas-account-content\s*\{[^}]*max-width:none/s);
  assert.match(styles, /\.saas-account-shell \.saas-account-content>\.app-content\s*\{[^}]*max-width:none/s);
  assert.match(styles, /\.saas-account-shell \.saas-owner-sidebar\s*\{/);
  assert.match(styles, /--owner-edge:color-mix|--owner-edge: color-mix/);
  for (const color of ['var(--surface)', 'var(--primary)', 'var(--border)', 'var(--text-primary)']) {
    assert.ok(styles.includes(color), `theme variable missing: ${color}`);
  }
  assert.doesNotMatch(styles, /(^|[\s,{])body\s*\{|transform:\s*scale\(/);
});

test('owner sidebar keeps role-filtered navigation and the sign out action', () => {
  assert.match(layout, /access\.can\(route\.permission\)/);
  assert.match(layout, /NavLink\s+key=\{path\}\s+to=\{path\}/);
  assert.match(layout, /end=\{path === '\/account'\}/);
  assert.match(layout, /className="saas-owner-sidebar-scroll"/);
  assert.match(layout, /className="saas-owner-sidebar-foot"/);
  assert.match(layout, /onClick=\{signOut\}/);
  assert.match(access, /const can = useCallback/);
});

test('wallet refresh, payment, permission checks and live metrics remain intact', () => {
  assert.match(account, /visibleTabs = tabs\.filter\(tab => isCompanyOwner && can\(tab\[4\]\)\)/);
  assert.match(wallet, /creditWalletService\.overview\(\)/);
  assert.match(wallet, /featureAccess\.can\(route\.permission\)/);
  assert.match(wallet, /featureAccess\.refresh\(\)/);
  assert.match(wallet, /purchaseCredits\(pack\.id\)/);
  assert.match(wallet, /wallet\?\.balance/);
  assert.match(styles, /\.cg-credit-metrics/);
  assert.match(styles, /\.cg-credit-shortcuts button/);
});

test('responsive tablet/phone layout and reduced-motion support are present', () => {
  for (const breakpoint of ['1250px','900px','760px','520px']) {
    assert.ok(styles.includes(`max-width:${breakpoint}`), breakpoint);
  }
  assert.match(styles, /grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(styles, /grid-template-columns:1fr/);
  assert.match(styles, /overflow-x:auto/);
  assert.match(styles, /:focus-visible/);
  assert.match(styles, /prefers-reduced-motion:reduce/);
  assert.doesNotMatch(styles, /\.template-preview\s*\{/);
});
