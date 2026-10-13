import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const page = read('../src/pages/jobs/JobPartsWorkflow.jsx');
const css = read('../src/styles/job-parts-ui.css');

test('Parts table has correctly labeled columns and keyboard-scrollable region', () => {
  assert.match(page, /className="job-parts-table-wrap hidden overflow-x-auto md:block" role="region" aria-label="Job Card parts records" tabIndex=\{0\}/);
  assert.match(page, /<table className="job-parts-record-table">/);
  assert.match(page, /<th scope="col">Part<\/th>/);
  assert.match(page, /<th scope="col">On Hand<\/th>/);
  assert.match(page, /<th scope="col">Requested<\/th>/);
  assert.match(page, /<th scope="col">Selling<\/th>/);
  assert.match(page, /className="job-parts-action-heading">Actions<\/th>/);
});

test('Part rows keep stock, quantity, amount and actions in their own columns', () => {
  assert.match(page, /className="job-parts-stock-cell"/);
  assert.match(page, /className="job-parts-part-cell"/);
  assert.match(page, /className="job-parts-part-name"/);
  assert.match(page, /className="job-parts-part-meta"/);
  assert.match(page, /className="job-parts-number-cell"/);
  assert.match(page, /className="job-parts-issue-cell"/);
  assert.match(page, /job-parts-selling-cell/);
  assert.match(page, /job-parts-row-actions/);
  assert.match(css, /\.job-parts-record-table :is\(th,td\):nth-child\(8\)/);
  assert.match(css, /\.job-parts-record-table \.job-parts-quantity-input/);
});

test('Issue, Order, Inward and Return retain existing handlers and busy protection', () => {
  assert.match(page, /onClick=\{onIssue\}/);
  assert.match(page, /onClick=\{onOrder\}/);
  assert.match(page, /onClick=\{onInward\}/);
  assert.match(page, /onClick=\{onReturn\}/);
  assert.match(page, /disabled=\{Boolean\(busy\)\}/);
  assert.match(page, /jobPartsService\.issue\(jobId/);
  assert.match(page, /jobPartsService\.returnPart\(jobId/);
});

test('Tablet shows two-column cards, mobile one-column, desktop keeps scrollable table', () => {
  assert.match(page, /job-parts-mobile-list grid gap-3 p-3 md:hidden/);
  assert.match(page, /className="job-parts-mobile-card/);
  assert.match(css, /@media \(min-width:768px\) and \(max-width:1099px\)/);
  assert.match(css, /grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(css, /@media \(max-width:767px\)/);
  assert.match(css, /\.job-parts-refined \.job-parts-mobile-actions/);
  assert.match(css, /@media\(max-width:379px\)/);
});

test('Part controls are regular-weight and actions have useful touch targets', () => {
  assert.match(css, /\.job-parts-record-table \.job-parts-quantity-input/);
  assert.match(css, /font-weight:400!important/);
  assert.match(css, /min-height:44px/);
  assert.match(css, /\.job-parts-row-actions \.job-parts-action-button\.primary-button/);
});
