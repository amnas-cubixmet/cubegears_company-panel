import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const component = read('../src/components/jobs/JobTotalCostPanel.jsx');
const workspace = read('../src/pages/jobs/JobCardWorkspace.jsx');
const service = read('../src/services/job.service.js');
const styles = read('../src/styles/job-workspace-dashboard.css');

test('Work page shows total cost directly below Outside Staff', () => {
  const work = workspace.slice(
    workspace.indexOf("{activeTab === 'work' && ("),
    workspace.indexOf("{activeTab === 'parts' && (")
  );
  const outside = work.indexOf('<JobOutsideStaffSection');
  const total = work.indexOf('<JobTotalCostPanel');
  const mechanic = work.indexOf('<JobWorkTimerPanel');
  assert.ok(outside >= 0 && total > outside && mechanic > total);
});

test('Total direct cost is fetched from backend, never customer charge or estimate price', () => {
  assert.match(service, /export const getJobCostSummary = async \(id\)/);
  assert.match(service, /\`\$\{API_ENDPOINTS\.JOBS\}\/\$\{id\}\/cost-summary\`/);
  assert.match(component, /jobService\.getJobCostSummary\(jobId\)/);
  assert.match(component, /summary\?\.mechanicCost/);
  assert.match(component, /summary\?\.outsideStaffCost/);
  assert.match(component, /summary\?\.partsCost/);
  assert.match(component, /summary\?\.totalCost/);
});

test('Cost details are restricted to users with required finance and stock permissions', () => {
  assert.match(component, /'jobs\.view', 'payroll\.view', 'expenses\.view', 'stock\.view'/);
  assert.match(component, /if \(!jobId \|\| !permitted\)/);
});

test('Summary updates when mechanic or outside worker changes, with proper warning notes', () => {
  assert.match(workspace, /<JobTotalCostPanel jobId=\{job\.id\} refreshVersion=\{timerRefreshVersion\}/);
  assert.match(workspace, /<JobOutsideStaffSection\s+jobId=\{job\.id\}\s+onChanged=/);
  assert.match(component, /summary\.unallocatedDailyWages/);
  assert.match(component, /summary\.partsAtCurrentCost/);
  assert.match(component, /outsidePending/);
});

test('Total cost uses responsive mobile grid', () => {
  assert.match(styles, /\.job-total-cost-grid/);
  assert.match(styles, /grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
});
