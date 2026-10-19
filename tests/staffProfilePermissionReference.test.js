import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const profile = readFileSync(
  new URL('../src/pages/staff-management/staff/StaffProfile.jsx', import.meta.url),
  'utf8',
);

test('Staff Profile uses the imported feature access permission helper', () => {
  assert.match(profile, /import \{ useFeatureAccess \} from '\.\.\/\.\.\/\.\.\/context\/FeatureAccessContext'/);
  assert.match(profile, /const \{ can \} = useFeatureAccess\(\)/);
  assert.match(profile, /canAssignRole=\{can\('company\.manage'\)\}/);
  assert.doesNotMatch(profile, /\bhasPermission\s*\(/);
});

test('profile still respects backend-confirmed staff and paid-feature rights', () => {
  for (const permission of ['staff.edit', 'company.manage', 'jobs.view', 'attendance.manage', 'payroll.view', 'payroll.edit']) {
    assert.ok(profile.includes(`can('${permission}')`), permission);
  }
  assert.match(profile, /canAssignRole=\{can\('company\.manage'\)\}/);
});
