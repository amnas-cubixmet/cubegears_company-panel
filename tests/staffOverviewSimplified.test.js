import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');

test('staff overview is a simple API-backed dashboard without mock widgets', () => {
  const overview = read('src/pages/staff-management/SimpleStaffOverview.jsx');
  const root = read('src/pages/employees/StaffManagement.jsx');
  assert.match(root, /<SimpleStaffOverview\s*\/>/);
  assert.doesNotMatch(root, /<StaffManagementTabs\s*\/>/);
  assert.match(overview, /staffService\.getStaff\(\{ liveOnly: true \}\)/);
  assert.match(overview, /setError\(requestError\?\.message/);
  assert.match(overview, /setReload\(value => value \+ 1\)/);
  assert.doesNotMatch(overview, /mock\/|staffPerformance|staffJobAssignments|jobService|getTeams\(/);
  assert.match(overview, /No staff added yet\./);
  assert.match(overview, /No staff match your search\./);
});

test('only real staff records contribute to totals and searchable preview', () => {
  const page = read('src/pages/staff-management/SimpleStaffOverview.jsx');
  assert.match(page, /total: staff\.length/);
  assert.match(page, /staff\.filter\(person => ACTIVE_STATUSES\.has/);
  assert.match(page, /matchingStaff\.slice\(0, 8\)\.map/);
  assert.match(page, /person\.name/);
  assert.match(page, /person\.employeeId/);
  assert.match(page, /navigate\(`\/staff-management\/staff\/\$\{person\.id\}`\)/);
  assert.match(read('src/pages/staff-management/Staff.jsx'), /getStaff\(\{ liveOnly: true \}\)/);
  assert.match(read('src/services/staff.service.js'), /if \(liveOnly \|\| !USE_MOCK_API\)/);
});

test('staff-management actions preserve role checks and deep links', () => {
  const overview = read('src/pages/staff-management/SimpleStaffOverview.jsx');
  assert.match(overview, /hasPermission\(user, 'staff\.create'\)/);
  assert.match(overview, /hasPermission\(user, 'company\.manage'\)/);
  assert.match(overview, /\/staff-management\/roles/);
  assert.match(overview, /\/staff-management\/add/);
  assert.match(overview, /\/staff-management\/staff/);
  const routes = read('src/routes/AppRoutes.jsx');
  for (const route of ['/staff-management/overview', '/staff-management/staff', '/staff-management/roles', '/staff-management/teams', '/staff-management/shifts']) {
    assert.ok(routes.includes(`path="${route}"`), route);
  }
});

test('responsive style does not shrink desktop typography and preserves mobile list', () => {
  const css = read('src/styles/staff-simple-overview.css');
  assert.match(css, /\.staff-simple-metrics/);
  assert.match(css, /@media\(max-width:520px\)/);
  assert.match(css, /\.staff-simple-person-branch\{display:none\}/);
  assert.match(read('src/pages/employees/StaffManagement.jsx'), /staff-simple-overview\.css/);
});
