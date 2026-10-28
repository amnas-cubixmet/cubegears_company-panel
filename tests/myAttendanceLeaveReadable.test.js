import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { todayForLeaveDate } from '../src/components/my-attendance/leaveDate.utils.js';

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');

test('leave date defaults to local today instead of UTC today', () => {
  assert.equal(todayForLeaveDate(new Date(2026, 9, 28, 0, 15)), '2026-10-28');
  assert.equal(todayForLeaveDate(new Date(2027, 0, 1, 23, 58)), '2027-01-01');
  assert.equal(todayForLeaveDate(new Date(2026, 1, 9, 12, 0)), '2026-02-09');
  assert.doesNotMatch(read('src/components/my-attendance/leaveDate.utils.js'), /toISOString\(/);
});

test('each new Apply for Leave initializes both date fields to today but keeps them editable', () => {
  const page = read('src/pages/my-attendance/LeaveRequests.jsx');
  const form = read('src/components/my-attendance/ApplyLeaveForm.jsx');
  assert.match(page, /const today = todayForLeaveDate\(\)/);
  assert.match(page, /startDate: today/);
  assert.match(page, /endDate: today/);
  assert.match(page, /setForm\(createInitialForm\(\)\)/);
  assert.match(form, /type="date"/);
  assert.match(form, /value=\{form\.startDate\}/);
  assert.match(form, /startDate: event\.target\.value/);
  assert.match(form, /endDate: event\.target\.value/);
  assert.match(form, /required/);
});

test('redundant unpaid leave wage notice removed from header and modal, without changing payroll', () => {
  const form = read('src/components/my-attendance/ApplyLeaveForm.jsx');
  const heading = read('src/components/my-attendance/LeavePageHeader.jsx');
  assert.doesNotMatch(form, /All leave is unpaid|full-day leave earns|verified half-day work/);
  assert.doesNotMatch(form, /apply-leave-balance-note/);
  assert.doesNotMatch(heading, /₹0 base wage/);
  assert.match(heading, /Apply for leave and track your request status/);
  assert.match(form, /Half Day Session/);
  assert.match(form, /Submit Application/);
});

test('responsive attendance status/session and leave form have readable font sizes', () => {
  const calendar = read('src/pages/my-attendance/HolidayCalendar.jsx');
  const leave = read('src/pages/my-attendance/LeaveRequests.jsx');
  const punch = read('src/styles/attendance-punch-readable.css');
  const form = read('src/styles/attendance-leave-readable.css');
  assert.match(calendar, /import '..\/..\/styles\/attendance-punch-readable.css'/);
  assert.match(leave, /import '..\/..\/styles\/attendance-leave-readable.css'/);
  for (const selector of [
    '.attendance-punch-status small', '.attendance-punch-status strong',
    '.attendance-punch-note span', '.attendance-session-title strong',
    '.attendance-session-times b',
  ]) assert.ok(punch.includes(selector), 'Missing punch typography selector '+selector);
  assert.match(punch, /grid-template-columns: repeat\(auto-fit, minmax\(min\(100%, 205px\), 1fr\)\)/);
  assert.match(punch, /@media \(max-width: 620px\)/);
  for (const selector of [
    '.apply-leave-form label > span', '.apply-leave-form textarea',
    '.apply-leave-form .apply-leave-actions button',
    '.attendance-leave-dashboard .leave-request-mobile-head strong',
  ]) assert.ok(form.includes(selector), 'Missing leave selector '+selector);
  assert.match(form, /font-size: 16px/);
  assert.match(form, /@media \(max-width: 520px\)/);
});
