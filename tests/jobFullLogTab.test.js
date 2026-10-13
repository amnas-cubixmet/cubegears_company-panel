import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const workspace = read('../src/pages/jobs/JobCardWorkspace.jsx');
const route = read('../src/routes/AppRoutes.jsx');
const log = read('../src/components/jobs/JobActivityTimeline.jsx');
const css = read('../src/styles/job-workspace-dashboard.css');
const svc = read('../src/services/job.service.js');

test('Full Log has a visible dedicated tab beside the six workflow stages', () => {
  assert.match(workspace, /\['activity', 'Full Log'\]/);
  assert.match(workspace, /className=\{\['job-full-log-tab'/);
  assert.match(workspace, /<span>Full Log<\/span>/);
  assert.match(workspace, /onClick=\{\(\) => openTab\('activity'\)\}/);
  assert.match(workspace, /aria-current=\{activeTab === 'activity' \? 'page' : undefined\}/);
  const navStart = workspace.indexOf('<div className="job-simple-step-nav"');
  const navEnd = workspace.indexOf('{showWorkTools && (', navStart);
  const nav = workspace.slice(navStart, navEnd);
  assert.ok(nav.indexOf('<nav ref={workflowTabsRef}') < nav.indexOf('job-full-log-tab'));
});

test('Full Log is not a seventh required stage and does not show stage status', () => {
  assert.match(workspace, /const visibleTabs = TABS\.filter\(\(\[key\]\) => GUIDED_STAGES\.includes\(key\)\)/);
  assert.match(workspace, /const showWorkTools = activeTab === 'work' \|\| \(activeExtraTab && activeTab !== 'activity'\)/);
  assert.match(workspace, /activeTab !== 'activity' && !showWorkTools/);
  assert.match(workspace, /activeTab !== 'activity' && <span className=\{'job-workspace-section-state/);
  assert.match(workspace, /!showWorkTools && activeTab !== 'activity'/);
  assert.doesNotMatch(workspace, /\['activity', 'Activity'\]/);
});

test('Full Log deep link works; older Activity link is still supported', () => {
  assert.match(route, /path="\/jobs\/:id\/full-log"/);
  assert.match(route, /path="\/jobs\/:id\/activity"/);
  assert.match(workspace, /section === 'full-log' \? 'activity'/);
  assert.match(workspace, /requested === 'full-log'/);
  assert.match(workspace, /key === 'activity' \? 'full-log' : key/);
});

test('Timeline uses recorded backend data, search, sorting, and safe empty state', () => {
  assert.match(workspace, /<JobActivityTimeline jobId=\{job\.id\}/);
  assert.match(svc, /\$\{id\}\/activity/);
  assert.match(log, /getJobActivity\(jobId\)/);
  assert.match(log, /GROUPS\.map/);
  assert.match(log, /setSort/);
  assert.match(log, /No recorded activity yet/);
  assert.match(log, /Earlier unrecorded actions cannot be reconstructed/);
});

test('Full Log stays visible and keyboard accessible on narrow screens', () => {
  assert.match(css, /\.job-full-log-tab \{/);
  assert.match(css, /\.job-full-log-tab:focus-visible/);
  assert.match(css, /\.job-full-log-tab\.is-active/);
  assert.match(css, /@media \(max-width:600px\)/);
  assert.match(css, /flex:0 0 auto/);
});
