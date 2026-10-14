import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { getStaffLandingPath } from '../src/utils/staffLanding.js';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const login = read('../src/pages/auth/Login.jsx');
const setup = read('../src/pages/auth/SetupPassword.jsx');
const forgot = read('../src/pages/auth/ForgotPassword.jsx');
const reset = read('../src/pages/auth/ResetPassword.jsx');
const magic = read('../src/pages/auth/MagicLinkVerify.jsx');
const addStaff = read('../src/pages/staff-management/StaffAddPage.jsx');

const member = (permissions) => ({ role: { permissions } });

test('staff is sent to the first page their actual role allows', () => {
  assert.equal(getStaffLandingPath(member(['jobs.view'])), '/jobs');
  assert.equal(getStaffLandingPath(member(['attendance.self'])), '/my-attendance');
  assert.equal(getStaffLandingPath(member(['stock.view'])), '/stock');
  assert.equal(getStaffLandingPath(member(['dashboard.view'])), '/dashboard');
  assert.equal(getStaffLandingPath(member([])), '/access-denied');
});

test('staff cannot redirect into unauthorised routes after login', () => {
  const mechanic = member(['jobs.view', 'attendance.self']);
  assert.equal(getStaffLandingPath(mechanic, '/payroll'), '/jobs');
  assert.equal(getStaffLandingPath(mechanic, '//outside.example'), '/jobs');
  assert.equal(getStaffLandingPath(mechanic, '/jobs/new'), '/jobs');
  assert.equal(getStaffLandingPath(mechanic, '/jobs?id=1'), '/jobs?id=1');
  assert.equal(getStaffLandingPath(member(['jobs.view', 'jobs.create']), '/jobs/new'), '/jobs/new');
});

test('password setup and magic link honour current role instead of forcing Dashboard', () => {
  assert.match(setup, /getStaffLandingPath\(user\)/);
  assert.match(magic, /getStaffLandingPath\(result\?\.user, next\)/);
  assert.match(login, /getStaffLandingPath\(authenticatedUser, params\.get\('next'\)\)/);
  assert.match(read('../src/pages/auth/AccessDenied.jsx'), /getStaffLandingPath\(user\)/);
});

test('login and recovery forms show red input/link validation on failures', () => {
  assert.match(login, /'Enter a valid email address\.'/);
  assert.match(forgot, /'Enter a valid email address\.'/);
  assert.match(setup, /setup link is incomplete/);
  assert.match(reset, /reset link is incomplete/);
  for (const page of [login, setup, reset, forgot]) {
    assert.match(page, /is-error/);
    assert.match(page, /auth-field-error/);
  }
});

test('Add Staff validates invite email, restricts owner roles and describes onboarding', () => {
  assert.match(addStaff, /!role\.isProtected && !role\.is_system/);
  assert.match(addStaff, /showFormFieldError\(formRef\.current, 'email'/);
  assert.match(addStaff, /showFormFieldError\(formRef\.current, 'role'/);
  assert.match(addStaff, /name="role"/);
  assert.match(addStaff, /secure password setup invitation/);
});
