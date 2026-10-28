import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL('../' + path, import.meta.url), 'utf8');

test('estimate work and labour inputs use responsive iPhone grid and proper 16px focus size', () => {
  const jsx = read('src/components/jobs/QuickEstimatePanel.jsx');
  const css = read('src/styles/job-estimate-iphone.css');
  const parent = read('src/pages/jobs/JobCardWorkspace.jsx');
  for (const cls of [
    'job-quick-description', 'job-quick-field-type', 'job-quick-field-qty',
    'job-quick-field-price', 'job-quick-field-hsn', 'job-quick-field-gst',
  ]) {
    assert.match(jsx, new RegExp(cls));
    assert.match(css, new RegExp(cls));
  }
  assert.match(css, /@media \(max-width: 600px\)/);
  assert.match(css, /@media \(max-width: 350px\)/);
  assert.match(css, /grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/);
  assert.match(css, /grid-column: 1 \/ -1/);
  assert.match(css, /font-size: 16px !important/);
  assert.match(css, /min-height: 50px/);
  assert.match(css, /job-quick-line-total/);
  assert.match(parent, /import '..\/..\/styles\/job-estimate-iphone\.css'/);
});

test('approved estimate sharing uses previously prepared File and retains download fallback', () => {
  const source = read('src/pages/jobs/JobCardWorkspace.jsx');
  assert.match(source, /const \[approvedPdfFile, setApprovedPdfFile\]/);
  assert.match(source, /createApprovedEstimatePdfFile\(pdfOffer\.job, pdfOffer\.estimate\)/);
  assert.match(source, /const shareApprovedPdf = \(\) =>/);
  assert.match(source, /const result = navigator\.share\(\{/);
  assert.match(source, /files: \[approvedPdfFile\]/);
  assert.match(source, /onClick=\{shareApprovedPdf\}/);
  assert.match(source, /pdfOffer\?\.nextStage \? 'Continue to Work' : 'Close'/);
  assert.doesNotMatch(source, /\{pdfOffer\.nextStage \?/);
  assert.match(source, /onClick=\{\(\) => downloadApprovalPdf\(pdfOffer\.job, pdfOffer\.estimate\)\}/);
});
