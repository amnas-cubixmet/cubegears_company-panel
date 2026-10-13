import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const component = read('../src/components/jobs/JobTotalCostPanel.jsx');
const workspace = read('../src/pages/jobs/JobCardWorkspace.jsx');
const service = read('../src/services/job.service.js');
const styles = read('../src/styles/job-workspace-dashboard.css');

test('Total Cost is visible once in the shared Job Card header, before every tab', () => {
  const top = workspace.indexOf('<JobTotalCostPanel');
  const header = workspace.indexOf('<header className="job-detail-header');
  const nav = workspace.indexOf('<div className="job-simple-step-nav"');
  const work = workspace.indexOf("{activeTab === 'work' && (");
  assert.ok(header >= 0 && top > header && nav > top && work > nav);
  assert.equal(workspace.split('<JobTotalCostPanel').length - 1, 1);
  assert.match(workspace, /refreshOnTab=\{activeTab\}/);
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
  assert.match(workspace, /<JobTotalCostPanel[\s\S]*?refreshVersion=\{timerRefreshVersion\}[\s\S]*?refreshOnTab=\{activeTab\}/);
  assert.match(workspace, /<JobOutsideStaffSection\s+jobId=\{job\.id\}\s+onChanged=/);
  assert.match(workspace, /<JobPartsWorkflow[\s\S]*?onJobUpdated=\{\(\) => \{\s*setTimerRefreshVersion/);
  assert.match(component, /\[jobId, refreshVersion, refreshOnTab, permitted, reload\]/);
  assert.match(component, /summary\.unallocatedDailyWages/);
  assert.match(component, /summary\.partsAtCurrentCost/);
  assert.match(component, /outsidePending/);
});

test('Total cost uses responsive mobile grid', () => {
  assert.match(styles, /\.job-total-cost-grid/);
  assert.match(styles, /grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
});

test('global cost is mobile friendly and includes outside-shop purchases without double counting', () => {
  assert.match(styles, /\.job-total-cost-panel\.is-global/);
  assert.match(styles, /@media \(max-width:900px\)/);
  assert.match(styles, /@media \(max-width:540px\)/);
  assert.match(component, /summary\.outsidePartsCost/);
  assert.match(component, /already counted in Parts Cost/);
  assert.match(component, /'jobs\.view', 'payroll\.view', 'expenses\.view', 'stock\.view'/);
});
