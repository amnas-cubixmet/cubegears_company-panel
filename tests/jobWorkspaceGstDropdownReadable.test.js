import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { estimateGstChoices } from '../src/components/jobs/estimateGstRates.js';
import { calculateEstimateIndiaGst } from '../src/utils/indiaGst.js';

const read = path => readFileSync(new URL('../'+path,import.meta.url),'utf8');
const estimate = read('src/components/jobs/QuickEstimatePanel.jsx');
const workspace = read('src/pages/jobs/JobCardWorkspace.jsx');
const css = read('src/styles/job-workspace-readable.css');

test('Job Estimate displays the same ten named GST options, preserving old rates', () => {
  assert.deepEqual(estimateGstChoices(), [
    'cgst:2.5','cgst:5','cgst:9','cgst:18',
    'sgst:2.5','sgst:5','sgst:9','sgst:18','igst:5','igst:18',
  ]);
  assert.equal(estimateGstChoices('18').length, 10);
  assert.ok(estimateGstChoices('12').includes('saved:12'));
  assert.ok(!estimateGstChoices('999').includes('saved:999'));
  assert.ok(!estimateGstChoices('invalid').includes('saved:invalid'));
  assert.match(estimate, /className="job-quick-gst-select"/);
  assert.match(estimate, /<option value="">Select GST Rate<\/option>/);
  assert.match(estimate, /estimateGstOptions\(line\.taxRate, taxMode/);
  assert.match(estimate, /chooseGst\(line\.key, event\.target\.value\)/);
  assert.doesNotMatch(estimate, /<input type="number" min="0" max="100" step="0.01"/);
});

test('GST estimation retains server format and intra-state vs inter-state calculation', () => {
  const lines = [{type:'Labour',quantity:'1',unitPrice:'100',taxRate:'18'}];
  const local = calculateEstimateIndiaGst({lines,registered:true,supplierState:'32',placeOfSupply:'32'});
  assert.equal(local.cgst,9);
  assert.equal(local.sgst,9);
  assert.equal(local.igst,0);
  assert.equal(local.total,118);
  const interstate = calculateEstimateIndiaGst({lines,registered:true,supplierState:'32',placeOfSupply:'33'});
  assert.equal(interstate.cgst,0);
  assert.equal(interstate.sgst,0);
  assert.equal(interstate.igst,18);
  assert.equal(interstate.total,118);
  assert.match(estimate, /taxRate: taxRate \|\| '0'/);
  assert.match(estimate, /supplierState, placeOfSupply/);
});

test('Overview Inspection and Estimate share readable scoped CSS, without changing job workflow', () => {
  assert.match(workspace, /job-workspace-readable.css/);
  for (const section of ["activeTab === 'inspection'", "activeTab === 'estimate'", "activeTab === 'overview'"]) {
    assert.ok(workspace.includes(section), 'Missing job workflow stage '+section);
  }
  for(const selector of [
    '.job-detail-summary > div',
    '.job-workflow-tab',
    '.cg-inspection-overview',
    '.cg-inspection-check-name > span',
    '.job-quick-header h2',
    '.job-quick-line-fields label',
    '.job-quick-estimate select.job-quick-gst-select',
  ]) {
    assert.ok(css.includes(selector),'Missing typography selector '+selector);
  }
  assert.match(css,/font-size: 16px !important/);
  assert.match(css,/min-height: 44px/);
  assert.match(css,/@media \(max-width: 420px\)/);
});
