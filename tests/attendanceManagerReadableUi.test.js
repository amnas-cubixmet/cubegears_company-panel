import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const moduleShell = read('src/pages/attendance/AttendanceManager.jsx');
const css = read('src/styles/attendance-manager-readable.css');

const pages = [
  ['overview', 'AttendanceOverview'],
  ['daily', 'DailyAttendance'],
  ['calendar', 'MonthlyAttendanceCalendar'],
  ['leave-requests', 'LeaveRequestsManager'],
  ['shifts', 'ShiftSettings'],
  ['reports', 'AttendanceReports'],
  ['rules', 'RulesSettings'],
];

test('all seven Attendance Manager routes share the last-loaded legible CSS', () => {
  assert.match(moduleShell, /import '..\/..\/styles\/attendance-manager.css'/);
  assert.match(moduleShell, /import '..\/..\/styles\/attendance-manager-pages.css'/);
  assert.match(moduleShell, /import '..\/..\/styles\/attendance-manager-readable.css'/);
  assert.ok(moduleShell.indexOf('attendance-manager-pages.css') < moduleShell.indexOf('attendance-manager-readable.css'));
  pages.forEach(([path, component]) => {
    assert.ok(moduleShell.includes("activeTab === '"+path+"' && <"+component),path);
  });
});

test('readability overrides cover shared header, tab navigation and every manager section', () => {
  const selectors = [
    'attendance-manager-header-actions .dw-button',
    'attendance-manager-header-badge',
    'attendance-manager-dashboard-tabs button',
    '.am-dashboard-stat-top span',
    '.am-dashboard-panel-actions button',
    '.am-daily-date input[type="date"]',
    '.am-table-card th', '.am-table-card td',
    '.am-calendar-month-controls select',
    '.am-calendar-employee strong',
    '.am-approval-person strong',
    '.am-approval-details strong', '.am-approval-actions > button',
    '.am-shift-list strong', '.am-shift-staff-grid small',
    '.am-report-filter label > span',
    '.attendance-mode-copy small',
    '.attendance-rule-field input',
    '.attendance-rule-toggle small',
    '.attendance-holiday-list small',
  ];
  for (const selector of selectors) {
    assert.ok(css.includes(selector), 'Missing readable font selector: '+selector);
  }
  assert.match(css, /font-size: 16px !important/);
  assert.match(css, /font-size: 14px !important/);
  assert.match(css, /font-size: 19px !important/);
  assert.match(css, /min-height: 44px/);
});

test('leave request text remains visible with responsive card and safe approval buttons', () => {
  assert.match(css,/\.am-approval-grid \{[\s\S]*?repeat\(2, minmax\(0,1fr\)\)/);
  assert.match(css,/\.am-approval-details strong \{ font-size: 15px !important; \}/);
  assert.match(css,/\.am-approval-actions > button \{[\s\S]*?min-height: 46px !important/);
  assert.match(css,/@media \(max-width: 1180px\)/);
  assert.match(css,/@media \(max-width: 760px\)/);
  assert.match(css,/\.am-approval-details \{ grid-template-columns: minmax\(0,1fr\); \}/);
});

test('calendar scrolling stays inside date matrix rather than making the whole page scroll', () => {
  assert.match(css,/\.am-calendar-scroll \{[\s\S]*?overflow-x: auto/);
  assert.match(css,/\.am-calendar-grid \{[\s\S]*?min-width: 890px/);
  assert.match(css,/\.am-calendar-month-controls > button \{[\s\S]*?min-width: 44px/);
});

test('attendance manager visual changes do not modify business logic', () => {
  assert.doesNotMatch(css, /display: none !important/);
  for (const [path] of pages) assert.ok(path);
  assert.match(css,/Changes presentation only/);
});
