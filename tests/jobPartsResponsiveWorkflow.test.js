import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (file) => readFileSync(new URL(file, import.meta.url), 'utf8');
const parts = read('../src/pages/jobs/JobPartsWorkflow.jsx');
const css = read('../src/styles/job-workspace-dashboard.css');
const service = read('../src/services/jobParts.service.js');

test('parts page uses issued records for real-value summary metrics', () => {
  assert.match(parts, /Parts Used/);
  assert.match(parts, /Quantity Issued/);
  assert.match(parts, /Issued Selling Value/);
  assert.match(parts, /Pending Quantity/);
  assert.match(parts, /Number\(line\.netIssued \|\| 0\)/);
});

test('inventory selector is searchable and does not silently create stock', () => {
  assert.match(parts, /Find Inventory Part/);
  assert.match(parts, /item\.barcode/);
  assert.match(parts, /setTimeout\(\(\) => setDeferredLookup\(lookup\), 250\)/);
  assert.match(parts, /Select a stock part/);
  assert.match(parts, /chosen\?\.partName/);
  assert.match(parts, /readOnly/);
  assert.match(parts, /Add to Job Card/);
  assert.match(service, /jobPartsService|addRequiredPart/);
});

test('Parts screen must not bypass guided Job Card workflow to deliver', () => {
  assert.doesNotMatch(parts, /updateJobStatus\(jobId, 'Ready for Delivery'\)/);
  assert.doesNotMatch(parts, /onComplete=\{markDone\}/);
});

test('issue and return quantities validate against server-supplied row values', () => {
  assert.match(parts, /value > Number\(line\.availableQty\)/);
  assert.match(parts, /value > Number\(line\.pendingQty\)/);
  assert.match(parts, /value > Number\(line\.netIssued\)/);
  assert.match(parts, /await load\(\)/);
});

test('styles provide two columns on mobile and normal input weights', () => {
  assert.match(css, /\.job-parts-metrics \{ grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(css, /\.job-parts-workflow input::placeholder \{ font-weight:400!important/);
  assert.match(css, /\.job-parts-tabs::-webkit-scrollbar \{ display:none/);
});
