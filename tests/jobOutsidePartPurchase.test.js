import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const page = read('../src/pages/jobs/JobPartsWorkflow.jsx');
const service = read('../src/services/jobParts.service.js');
const css = read('../src/styles/job-parts-ui.css');

test('job parts search supports stock and outside purchase directly', () => {
  assert.match(page, /Find & Add Stock/);
  assert.match(page, /Buy Outside/);
  assert.match(page, /No stock match/);
  assert.match(page, /partName: stockLookup/);
  assert.match(page, /available > 0 \? 'Select' : 'Buy Outside'/);
});

test('outside shop modal validates vendor, quantities, separate cost and sell price', () => {
  assert.match(page, /function OutsidePartPurchasePanel/);
  assert.match(page, /title="Buy Part From Outside Shop"/);
  assert.match(page, /Shop \/ Supplier Name/);
  assert.match(page, /Purchase Price \/ Unit/);
  assert.match(page, /Customer Selling Price \/ Unit/);
  assert.match(page, /requestId, partName:/);
  assert.match(page, /Save & Use Part/);
  assert.match(page, /disabled=\{!valid \|\| busy\}/);
});

test('outside purchases render persisted records with no stock movement', () => {
  assert.match(page, /getOutsideJobParts\(jobId\)/);
  assert.match(page, /jobPartsService\.buyOutsideJobPart\(jobId, payload\)/);
  assert.match(page, /outsideParts\.map/);
  assert.match(page, /Outside Shop Purchases/);
  assert.match(page, /No inventory stock entry or stock deduction/);
  assert.match(service, /\/job-cards\/\$\{jobId\}\/outside-parts/);
});

test('mock-mode stock changes preserve direct purchases', () => {
  assert.match(service, /outsideParts: Array\.isArray\(job\?\.partsWorkflow\?\.outsideParts\)/);
  assert.match(service, /outsideParts: previous\.outsideParts \|\| state\.outsideParts \|\| \[\]/);
  assert.match(service, /requestId === payload\.requestId/);
});

test('search UI and outside records remain responsive and single-border', () => {
  assert.match(css, /\.job-parts-inventory-search input \{/);
  assert.match(css, /border:1px solid var\(--border\)!important/);
  assert.match(css, /\.job-parts-outside-records/);
  assert.match(css, /@media\(max-width:767px\)/);
  assert.match(css, /font-size:16px!important/);
});
