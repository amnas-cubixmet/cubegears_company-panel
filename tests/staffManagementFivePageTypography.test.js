import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');

const shell = read('src/pages/employees/StaffManagement.jsx');
const styles = read('src/styles/staff-management-readable.css');

test('all five Staff Management sections share a last-loaded readable UI stylesheet', () => {
  const all = ['staff-management.css', 'staff-simple-overview.css', 'staff-management-readable.css'];
  all.forEach(name => assert.ok(shell.includes("styles/"+name),name));
  assert.ok(shell.indexOf(all[1])<shell.indexOf(all[2]),'readable sheet must load last');
  for (const section of ['overview','staff','roles','teams','shifts']) {
    assert.ok(shell.includes("'"+section+"'"),'missing section '+section);
  }
  assert.match(shell, /className="staff-management-page cg-staff-management"/);
});

test('staff page fonts and touch targets cover five feature groups', () => {
  for (const selector of [
    '.staff-dashboard-tab span',
    '.staff-simple-metrics span',
    '.staff-simple-person-details small',
    '.staff-directory-person strong',
    '.staff-directory-details span',
    '.staff-directory-card__actions button',
    '.roles-dashboard-card-meta span',
    '.role-permission-actions label',
    '.staff-team-card__meta',
    '.staff-team-member strong',
    '.staff-crud-detail-grid strong',
    '.staff-crud-actions button',
    '.staff-crud-check small',
    '.staff-subpage-kpis > article > span',
  ]) {
    assert.ok(styles.includes(selector), 'Missing readable staff selector: '+selector);
  }
  assert.match(styles,/font-size: 16px !important/);
  assert.match(styles,/font-size: 14px !important/);
  assert.match(styles,/min-height: 46px/);
  assert.match(styles,/min-height: 44px/);
});

test('mobile layout uses scrollable navigation and smaller non-overflowing cards', () => {
  assert.match(styles,/\.staff-dashboard-tabs__rail \{[\s\S]*?overflow-x: auto/);
  assert.match(styles,/@media \(max-width: 1100px\)/);
  assert.match(styles,/@media \(max-width: 700px\)/);
  assert.match(styles,/@media \(max-width: 420px\)/);
  assert.match(styles,/\.staff-card-grid,[\s\S]*?grid-template-columns: minmax\(0,1fr\)/);
  assert.match(styles,/\.staff-subpage-kpis \{ grid-template-columns: repeat\(2,minmax\(0,1fr\)\)/);
});

test('modal role/team/shift controls remain large enough for iPhone Safari input focus', () => {
  assert.match(styles,/\.role-editor-field input,[\s\S]*?font-size: 16px !important/);
  assert.match(styles,/\.staff-crud-form input:not\(\[type="checkbox"\]\),[\s\S]*?font-size: 16px !important/);
  assert.match(styles,/\.staff-crud-check input\[type="checkbox"\] \{ width: 19px/);
  assert.match(styles,/\.role-editor-actions button/);
  assert.doesNotMatch(styles,/display:\s*none\s*!important/);
});
