import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { jobWorkflowProgress } from '../src/components/dashboard/jobWorkflowProgress.js';

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');

test('Quick Actions appears above dashboard stats and never remains in the lower grid', () => {
  const page = read('src/pages/dashboard/Dashboard.jsx');
  const bottom = read('src/components/dashboard/DashboardBottomGrid.jsx');
  const top = page.indexOf('<QuickActionsPanel onNavigate={navigate}');
  const stats = page.indexOf('<DashboardStats data={data}');
  const service = page.indexOf('<ServiceOperations');
  assert.ok(top !== -1 && top < stats && stats < service);
  assert.doesNotMatch(bottom, /QuickActionsPanel/);
  assert.match(bottom, /FinancePanel/);
  assert.match(bottom, /WorkshopStaffPanel/);
});

test('actual Django 6-stage workflow drives job progress, never a fabricated 70 percent', () => {
  assert.deepEqual(jobWorkflowProgress({ status: 'New' }), {
    completed: 0, total: 6, percentage: 0,
  });
  assert.equal(jobWorkflowProgress({ status: 'In Progress' }).percentage, 50);
  assert.equal(jobWorkflowProgress({ status: 'in_progress' }).percentage, 50);
  assert.equal(jobWorkflowProgress({ status: 'Ready for Delivery' }).percentage, 83);
  assert.equal(jobWorkflowProgress({ status: 'Delivered' }).percentage, 100);
  assert.equal(jobWorkflowProgress({ status: 'unknown' }), null);
  assert.equal(jobWorkflowProgress(null), null);
  assert.equal(jobWorkflowProgress({
    status: 'Inspection',
    workflow_progress: { completed: ['overview', 'inspection', 'estimate'] },
  }).percentage, 50);
  assert.equal(jobWorkflowProgress({
    status: 'New',
    workflowProgress: { completed: ['overview', 'overview', 'work'] },
  }).completed, 2);
  const repair = read('src/components/dashboard/ActiveRepairPanel.jsx');
  assert.match(repair, /jobWorkflowProgress\(activeRepair\)/);
  assert.match(repair, /role="progressbar"/);
  assert.match(repair, /progress\?\.percentage/);
  assert.match(repair, /of \$\{progress\.total\} job stages completed/);
  assert.doesNotMatch(repair, /<strong>70%<\/strong>|width:70%/);
});

test('job stage count panel no longer flags the first three stages as completed', () => {
  const panel = read('src/components/dashboard/JobDetailPanel.jsx');
  assert.match(panel, /Workshop Job Stages/);
  assert.match(panel, /Job counts by stage/);
  assert.doesNotMatch(panel, /index < 3/);
  assert.match(panel, /jobProgress\?\.\[stage\.key\] \?\? 0/);
});

test('dashboard readability CSS sets non-microscopic font sizes and mobile layouts', () => {
  const page = read('src/pages/dashboard/Dashboard.jsx');
  const css = read('src/styles/dashboard-readable.css');
  assert.match(page, /import '..\/..\/styles\/dashboard-readable.css'/);
  for (const selector of [
    'stat-label', 'stat-meta', 'overall-progress-heading',
    'finance-list > div', 'staff-copy strong', 'staff-copy small',
    'booking-row-top strong', 'quick-actions button',
  ]) {
    assert.ok(css.includes(selector), 'Missing readable styles for '+selector);
  }
  assert.match(css, /grid-template-columns: repeat\(5, minmax\(0, 1fr\)\)/);
  assert.match(css, /grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/);
  assert.match(css, /@media\(max-width: 640px\)/);
  assert.match(css, /@media\(max-width: 420px\)/);
  assert.match(css, /font-size: 16px/);
});
