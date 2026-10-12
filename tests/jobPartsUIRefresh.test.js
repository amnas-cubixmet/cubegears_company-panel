import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const parts = read('../src/pages/jobs/JobPartsWorkflow.jsx');
const css = read('../src/styles/job-parts-ui.css');
const app = read('../src/App.jsx');

test('Parts UI has overview, one inventory Add Part action, and records in order', () => {
  assert.match(parts, /Parts Overview/);
  assert.match(parts, /Find & Add Stock/);
  assert.match(parts, /Parts Records/);
  assert.ok(parts.indexOf('Parts Overview') < parts.indexOf('Find & Add Stock'));
  assert.ok(parts.indexOf('Find & Add Stock') < parts.indexOf('Parts Records'));
  const top = parts.slice(parts.indexOf('const summary = useMemo'), parts.indexOf("{panel?.type === 'add'"));
  assert.equal((top.match(/setPanel\(\{ type: 'add' \}\)/g) || []).length, 1);
  assert.doesNotMatch(top, /Add Required Part/);
});

test('Stock search and records search remain independent', () => {
  assert.match(parts, /stockLookup\.trim\(\)/);
  assert.match(parts, /job-parts-inventory-search/);
  assert.match(parts, /job-parts-record-search/);
  assert.match(parts, /selectedPartId: item\.id/);
  assert.match(parts, /setPanel\(\{ type: 'add', selectedPartId: item\.id \}\)/);
  assert.match(parts, /value=\{search\}/);
});

test('Status tabs show API-derived counts and live, accessible active state', () => {
  assert.match(parts, /recordCounts = useMemo/);
  assert.match(parts, /pending: data\.lines\.filter/);
  assert.match(parts, /issued: data\.lines\.filter/);
  assert.match(parts, /returned: data\.lines\.filter/);
  assert.match(parts, /history: data\.transactions\.length/);
  assert.match(parts, /aria-pressed=\{tab === key\}/);
  assert.match(parts, /\{recordCounts\[key\]\}/);
});

test('History search filters real transactions while preserving stock operations', () => {
  assert.match(parts, /visibleTransactions = useMemo/);
  assert.match(parts, /<TransactionHistory transactions=\{visibleTransactions\}/);
  assert.match(parts, /jobPartsService\.issue\(jobId/);
  assert.match(parts, /jobPartsService\.returnPart\(jobId/);
  assert.match(parts, /jobPartsService\.createOrder\(jobId/);
  assert.match(parts, /jobPartsService\.inward\(jobId/);
});

test('Responsive CSS keeps two metric columns, regular inputs and readable mobile cards', () => {
  assert.match(css, /\.job-parts-refined/);
  assert.match(css, /grid-template-columns:repeat\(2,minmax\(0,1fr\)\)!important/);
  assert.match(css, /\.job-parts-mobile-list/);
  assert.match(css, /font-weight:400!important/);
  assert.match(css, /height:44px!important/);
  assert.match(css, /@media\(max-width:480px\)/);
  assert.match(app, /import '\.\/styles\/job-parts-ui\.css';/);
});

test('Loading state does not show inaccurate zero costs or cleared part status', () => {
  assert.match(parts, /loading\s*\? <span className="job-parts-loading-summary"/);
  assert.match(parts, /value=\{loading \? '—' : summary\.parts\}/);
  assert.match(parts, /value=\{loading \? '—' : money\.format\(summary\.selling\)\}/);
});
