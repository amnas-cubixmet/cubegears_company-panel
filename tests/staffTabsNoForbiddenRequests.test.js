import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const tabs = read('src/components/staff-management/StaffManagementTabs.jsx');
const management = read('src/pages/employees/StaffManagement.jsx');
const profile = read('src/pages/staff-management/staff/StaffProfile.jsx');
const jobService = read('src/services/job.service.js');
const header = read('src/components/layout/Header.jsx');
const styles = read('src/styles/staff-management.css');

test('Staff Management restores only five useful authorized tabs', () => {
  assert.match(management, /<StaffManagementTabs\s*\/>/);
  for (const page of ['overview','staff','roles','teams','shifts']) {
    assert.ok(tabs.includes('/staff-management/' + page), page);
  }
  assert.match(tabs, /const \{ can \} = useFeatureAccess\(\)/);
  assert.match(tabs, /staffManagementTabs\.filter\(\(tab\) => can\(tab\.permission\)\)/);
  assert.match(tabs, /company\.manage/);
  assert.match(tabs, /Roles & Permissions/);
  assert.match(tabs, /\/staff-management\/staff\/\[\^\/\]\+/);
  for (const extra of ["label: 'Performance'", "label: 'Documents'", "label: 'Reports'"]) {
    assert.ok(!tabs.includes(extra), extra);
  }
  assert.match(styles, /min-width: max-content/);
  assert.match(styles, /overflow-x: auto/);
});

test('Staff profile does not call paid Jobs from its default free overview', () => {
  const load = profile.slice(
    profile.indexOf('const loadSupportData ='),
    profile.indexOf('const refreshAll =')
  );
  assert.doesNotMatch(load, /jobService\.getJobs|roleService\.getRoles/);
  assert.match(profile, /const canViewJobs = can\('jobs\.view'\)/);
  assert.match(profile, /!staff\?\.id \|\| !canViewJobs/);
  assert.match(profile, /\['Assigned Work', 'Performance'\]\.includes\(activeTab\)/);
  assert.match(profile, /jobService\.getJobs\(\{ liveOnly: true \}\)/);
  assert.match(profile, /visibleTabs\.map/);
  assert.match(profile, /jobsError/);
  assert.doesNotMatch(profile, /staffJobAssignments|staffPerformance|USE_MOCK_API/);
  assert.match(jobService, /const \{ liveOnly = false, \.\.\.query \} = params \|\| \{\}/);
  assert.match(jobService, /USE_MOCK_API && !liveOnly/);
  assert.match(jobService, /params: query/);
});

test('Roles and paid attendance/payroll are conditionally requested or displayed', () => {
  assert.match(profile, /const canReadRoles = can\('company\.manage'\)/);
  assert.match(profile, /if \(!staff\?\.id \|\| !canReadRoles\)/);
  assert.match(profile, /const canManageAttendance = can\('attendance\.manage'\)/);
  assert.match(profile, /const canViewPayroll = can\('payroll\.view'\)/);
  assert.match(profile, /const canEdit = can\('staff\.edit'\)/);
});

test('notifications header does not query unauthorized module on route changes', () => {
  assert.match(header, /const canViewNotifications = can\('notifications\.view'\)/);
  assert.match(header, /if \(!canViewNotifications\) \{\s*setNotificationCount\(0\);\s*return undefined;/);
  assert.match(header, /\[location\.pathname, canViewNotifications\]/);
});
