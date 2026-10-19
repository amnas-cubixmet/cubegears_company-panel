import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { isAssignableStaffRole } from '../src/utils/isAssignableStaffRole.js';

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');

test('only active non-system company staff roles are assignable', () => {
  const roles = [
    { code: 'SUPER_ADMIN', isProtected: true, is_system: true, status: 'Active' },
    { code: 'SUPER_ADMIN', isProtected: false, is_system: false, status: 'Active' },
    { code: 'MECHANIC', isProtected: false, is_system: false, is_active: true, status: 'Inactive' },
    { code: 'TEAM_LEAD', isProtected: false, is_system: false, is_active: false, status: 'Active' },
    { code: 'ADVISOR', isProtected: false, is_system: true, is_active: true, status: 'Active' },
    { code: 'TECHNICIAN', isProtected: false, is_system: false, is_active: true, status: 'Active' },
    { code: 'RECEPTION', isProtected: false, is_system: false, is_active: true, status: 'Probation' },
  ];
  assert.deepEqual(roles.filter(isAssignableStaffRole).map(role => role.code), ['TECHNICIAN', 'RECEPTION']);
  assert.equal(isAssignableStaffRole(null), false);
});

test('role service implements getAssignableRoles from tenant-scoped Django roles', () => {
  const source = read('src/services/role.service.js');
  assert.match(source, /getAssignableRoles: async \(\) => \{/);
  assert.match(source, /const roles = await roleService\.getRoles\(\)/);
  assert.match(source, /return roles\.filter\(isAssignableStaffRole\)/);
  assert.match(source, /apiClient\.get\('\/roles\/'\)/);
  assert.doesNotMatch(source, /mockRolesList|setTimeout/);
});

test('Add Staff and Staff Profile use implemented method', () => {
  for (const path of ['src/pages/staff-management/StaffAddPage.jsx',
    'src/pages/staff-management/staff/StaffProfile.jsx']) {
    const source = read(path);
    assert.match(source, /roleService\.getAssignableRoles\(\)/, path);
  }
});
