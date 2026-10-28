import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');

const src = read('src/pages/jobs/JobCardWorkspace.jsx');
const shared = read('src/styles/job-four-stage-forms.css');

test('Overview, Inspection, Estimate and Work & Labour share one loaded input/list typography layer', () => {
  assert.match(src, /import '..\/..\/styles\/job-four-stage-forms\.css'/);
  for (const section of [
    '.job-overview-simple',
    '.cg-inspection',
    '.job-quick-estimate',
    '.job-work-simple',
  ]) assert.ok(shared.includes(section), section);
  assert.match(shared, /--job-body-font: 16px/);
  assert.match(shared, /--job-control-size: 48px/);
  assert.match(shared, /--job-label-font: 14px/);
  assert.match(shared, /:is\(input:not\(\[type="file"\]\):not\(\[type="checkbox"\]\):not\(\[type="radio"\]\), select, textarea\)/);
  assert.match(shared, /font-size: var\(--job-body-font\) !important/);
});

test('four workflow forms are mobile Safari safe without touching uploads/checkboxes', () => {
  assert.match(shared, /-webkit-text-size-adjust: 100%/);
  assert.match(shared, /touch-action: manipulation/);
  assert.match(shared, /@media \(max-width: 760px\)/);
  assert.match(shared, /@media \(max-width: 420px\)/);
  assert.match(shared, /--job-control-size: 50px/);
  assert.match(shared, /min-width: 0/);
  assert.match(shared, /input:not\(\[type="file"\]\)/);
  assert.match(shared, /overscroll-behavior: contain/);
});

test('stage-specific lists and fields have independent readable classes', () => {
  for (const klass of [
    '.job-overview-detail-grid dd',
    '.job-overview-mechanic-select',
    '.cg-inspection-check-name > span',
    '.cg-inspection .cg-inspection-search',
    '.job-quick-catalog-options',
    '.job-quick-line-header strong',
    '.job-work-items-row strong',
    '.job-work-timer-person strong',
    '.job-worker-assignment-item strong',
  ]) assert.ok(shared.includes(klass), klass);
  assert.match(src, /activeTab === 'overview'/);
  assert.match(src, /activeTab === 'inspection'/);
  assert.match(src, /activeTab === 'estimate'/);
  assert.match(src, /activeTab === 'work'/);
});

test('legacy important rules are overridden only in the four stage forms', () => {
  const legacy = read('src/styles/job-management.css');
  assert.match(legacy, /\.cg-job-detail label\{min-width:0;font-size:12px!important/);
  assert.match(legacy, /\.cg-job-detail input:not\(\[type="checkbox"\]\):not\(\[type="file"\]\)/);
  assert.match(shared, /Final cascade reconciliation/);
  assert.match(shared, /\.cg-job-detail\.job-workspace-dashboard :is\(/);
  assert.match(shared, /font-size: var\(--job-label-font\) !important/);
  assert.match(shared, /min-height: var\(--job-control-size\) !important/);
  assert.match(shared, /font-size: var\(--job-body-font\) !important/);
  assert.match(shared, /textarea \{/);
  assert.match(shared, /min-height: 96px !important/);
  assert.match(shared, /\.job-quick-catalog \.job-quick-catalog-field/);
  assert.match(shared, /\.cg-inspection-search/);
  assert.match(shared, /min-height: 0 !important/);
  assert.match(shared, /input:not\(\[type="file"\]\):not\(\[type="checkbox"\]\):not\(\[type="radio"\]\)/);
});
