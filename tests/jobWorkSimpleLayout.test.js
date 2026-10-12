import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const workspace = read('../src/pages/jobs/JobCardWorkspace.jsx');
const css = read('../src/styles/job-workspace-dashboard.css');

const workStart = workspace.indexOf("{activeTab === 'work' && (");
const partsStart = workspace.indexOf("{activeTab === 'parts' && (", workStart);
const work = workspace.slice(workStart, partsStart);

test('Outside Staff is the first feature in the Job Card Work stage', () => {
  assert.ok(workStart !== -1 && partsStart > workStart);
  const outside = work.indexOf('<JobOutsideStaffSection jobId={job.id} />');
  const internal = work.indexOf('<JobWorkerAssignments');
  const timers = work.indexOf('<JobWorkTimerPanel');
  const items = work.indexOf('Labour & Work Items');
  assert.ok(outside >= 0 && internal > outside && timers > internal && items > timers);
});

test('Remove duplicate Add Labour form, state, handler without hiding saved work entries', () => {
  assert.doesNotMatch(workspace, /const addLabour\s*=/);
  assert.doesNotMatch(workspace, /const blankLabour\s*=/);
  assert.doesNotMatch(workspace, /\[labour, setLabour\]/);
  assert.doesNotMatch(work, /<form onSubmit=\{addLabour\}/);
  assert.doesNotMatch(work, />Add Labour</);
  assert.match(work, /labourRecords\.map/);
  assert.match(work, /No labour entries yet/);
});

test('Work timer still allows recording internal mechanics without duplicate form', () => {
  assert.match(work, /<JobWorkTimerPanel/);
  assert.match(work, /jobStatus=\{normalizeJobStatus\(job\.status\)\}/);
  assert.match(work, /labourRecords=\{labourRecords\}/);
});

test('Labour & Work Items uses one responsive full width card with compact empty state', () => {
  assert.match(work, /job-work-items-panel/);
  assert.match(css, /\.job-work-items-panel \{/);
  assert.match(css, /min-height:0!important/);
  assert.match(css, /\.job-work-items-empty \{/);
  assert.match(css, /@media \(max-width:650px\)/);
});
