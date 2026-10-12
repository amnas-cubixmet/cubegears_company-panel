import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const page = read('../src/pages/jobs/JobPartsWorkflow.jsx');
const css = read('../src/styles/job-parts-ui.css');
const service = read('../src/services/jobParts.service.js');

test('desktop Parts table has accessible issue quantity and readable action buttons', () => {
  assert.match(page, /className="job-parts-action-cell"/);
  assert.match(page, /className="job-parts-row-actions"/);
  assert.match(page, /className="job-parts-action-heading"/);
  assert.match(page, /className="cubegears-input job-parts-quantity-input/);
  assert.match(page, /aria-label=\{\`Issue quantity for \$\{line\.partName\}\`\}/);
  assert.match(page, /aria-label=\{\`Return quantity for \$\{line\.partName\}\`\}/);
  assert.match(page, /job-parts-action-button[^"]*" disabled=\{Boolean\(busy\)\}/);
  assert.match(css, /\.job-parts-row-actions \{/);
  assert.match(css, /flex-wrap:nowrap!important/);
  assert.match(css, /\.job-parts-action-cell \{/);
  assert.match(css, /\.job-parts-row-actions \.job-parts-action-button \{/);
  assert.match(css, /white-space:nowrap!important/);
});

test('Outside Shop Purchases empty area lets staff launch the existing purchase form', () => {
  assert.match(page, /<div className="job-parts-outside-empty">/);
  assert.match(page, /No outside purchases yet/);
  assert.match(page, /className="secondary-button job-parts-outside-empty-action"/);
  assert.match(page, /onClick=\{\(\) => setPanel\(\{ type: 'outside', partName: stockLookup \}\)\}/);
  assert.match(page, /job-parts-outside-count/);
  assert.match(css, /\.job-parts-outside-empty-action \{/);
  assert.match(css, /\.job-parts-outside-empty-icon \{/);
});

test('Inventory Issue and outside purchases use the same existing backend operations', () => {
  assert.match(page, /jobPartsService\.issue\(jobId/);
  assert.match(page, /jobPartsService\.inward\(jobId/);
  assert.match(page, /jobPartsService\.buyOutsideJobPart\(jobId, payload\)/);
  assert.match(page, /getOutsideJobParts\(jobId\)/);
  assert.match(page, /outsideParts\.map/);
  assert.match(service, /outside-parts/);
});

test('Mobile records stay vertical while desktop table scrolls within its card', () => {
  assert.match(page, /job-parts-table-wrap hidden overflow-x-auto md:block/);
  assert.match(page, /job-parts-mobile-list grid gap-3 p-3 md:hidden/);
  assert.match(css, /\.job-parts-table-wrap table \{/);
  assert.match(css, /min-width:1010px/);
  assert.match(css, /\.job-parts-outside-empty-action \{/);
  assert.match(css, /@media\(max-width:767px\)/);
});
