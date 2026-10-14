import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const timeline = read('../src/components/jobs/JobActivityTimeline.jsx');
const workspace = read('../src/pages/jobs/JobCardWorkspace.jsx');
const service = read('../src/services/job.service.js');
const css = read('../src/styles/job-workspace-dashboard.css');

test('Job Card Activity tab fetches real audited backend events, not obsolete timeline state', () => {
  assert.match(workspace, /<JobActivityTimeline jobId=\{job\.id\}/);
  assert.doesNotMatch(workspace, /\[\.\.\.timeline, \.\.\.updates\.map/);
  assert.match(service, /getJobActivity = async \(id\)/);
  assert.match(service, /\$\{id\}\/activity/);
});

test('Activity supports date grouping, category filtering, searchable actor and chronological sorting', () => {
  assert.match(timeline, /GROUPS\.map/);
  assert.match(timeline, /activityCategory\(event\.event\)/);
  assert.match(timeline, /event\.actorName/);
  assert.match(timeline, /dateOf\(a\.created_at/);
  assert.match(timeline, /sort === 'newest'/);
  assert.match(timeline, /job-activity-day/);
  assert.match(timeline, /setRefresh\(\(number\) => number \+ 1\)/);
});

test('Job Activity renders genuine actors, descriptions, timestamps and status changes', () => {
  assert.match(timeline, /System \/ Unknown/);
  assert.match(timeline, /safeText\(event\.description\)/);
  assert.match(timeline, /safeText\(event\.from_status\)/);
  assert.match(timeline, /safeText\(event\.to_status\)/);
  assert.match(timeline, /<time dateTime=/);
});

test('When no history exists, page does not invent A-to-Z events', () => {
  assert.match(timeline, /No recorded activity yet/);
  assert.match(timeline, /Earlier unrecorded actions cannot be reconstructed/);
  assert.match(timeline, /saved activity history/);
});

test('Activity timeline uses one clean search field and responsive mobile layout', () => {
  assert.match(css, /\.job-activity-search input \{/);
  assert.match(css, /background:transparent!important/);
  assert.match(css, /\.job-activity-filters/);
  assert.match(css, /@media\(max-width:767px\)/);
  assert.match(css, /grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
});
