import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseAttendanceLocalDate } from '../src/components/my-attendance/attendance.utils.js';

const read = (path) => readFileSync(new URL('../' + path, import.meta.url), 'utf8');

test('local calendar date parser accepts date-only and ISO timestamp without timezone shift', () => {
  const date = parseAttendanceLocalDate('2026-10-27');
  assert.equal(date.getFullYear(), 2026);
  assert.equal(date.getMonth(), 9);
  assert.equal(date.getDate(), 27);
  assert.equal(parseAttendanceLocalDate('2026-10-27T09:45:00+05:30').getDate(), 27);
  assert.equal(parseAttendanceLocalDate('2026-10-27 09:45:00').getMonth(), 9);
});

test('invalid dates fail closed rather than rendering Invalid Date', () => {
  for (const input of ['', '2026-02-30', '2026-13-01', null, undefined, 'garbage']) {
    assert.equal(parseAttendanceLocalDate(input), null);
  }
});

test('calendar loads separate endpoints safely and exposes visible retry after errors', () => {
  const page = read('src/pages/my-attendance/HolidayCalendar.jsx');
  assert.match(page, /Promise\.allSettled\(\[/);
  assert.match(page, /attendanceService\.getCalendarEvents\(month, year\)/);
  assert.match(page, /attendanceService\.getPersonalAttendanceLogs\(\{ month, year \}\)/);
  assert.match(page, /attendanceService\.getAttendanceStatus\(\)/);
  assert.match(page, /setLoadError\(/);
  assert.match(page, /attendance-calendar-fetch-error" role="alert"/);
  assert.match(page, /setRefreshKey\(\(value\) => value \+ 1\)/);
  assert.match(page, /parseAttendanceLocalDate\(log\.date\)/);
  assert.match(page, /parseAttendanceLocalDate\(event\.date\)/);
  assert.doesNotMatch(page, /new Date\(`\$\{log\.date\}T00:00:00`\)/);
});

test('history does not claim empty data while loading and guards against invalid dates', () => {
  const page = read('src/components/my-attendance/AttendanceHistoryTable.jsx');
  assert.match(page, /loading = false/);
  assert.match(page, /parseAttendanceLocalDate\(log\.date\)\?\.toLocaleDateString/);
  assert.match(page, /!loading && !logs\.length/);
});

test('attendance fonts and mobile tabs have readable sizes', () => {
  const css = read('src/styles/attendance-calendar.css');
  const nav = read('src/styles/my-attendance-pages.css');
  assert.match(css, /attendance-calendar-redesign\{font-size:15px/);
  assert.match(css, /attendance-day-chip span\{font-size:14px/);
  assert.match(css, /attendance-history-table-new td,/);
  assert.match(nav, /my-attendance-dashboard-tabs button\{\s*min-height:44px/);
});

test('month selector no longer has invalid useMemo computed dependency expressions', () => {
  const header = read('src/components/my-attendance/AttendanceOverviewHeader.jsx');
  assert.doesNotMatch(header, /\[minimum\.getFullYear\(\), maximum\.getFullYear\(\)\]/);
  assert.match(header, /const years = Array\.from\(/);
});
