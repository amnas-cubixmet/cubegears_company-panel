import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const css = read('../src/styles/job-workspace-dashboard.css');
const section = read('../src/components/jobs/JobOutsideStaffSection.jsx');
const ledger = read('../src/components/jobs/OutsideLabourPanel.jsx');

test('Outside Staff shows its records without opening View Records', () => {
  assert.match(section, /'Add Outside Staff'/);
  assert.match(section, /onClick=\{addStaff\}/);
  assert.doesNotMatch(section, /'View Records'/);
  assert.doesNotMatch(section, /toggleRecords/);
  assert.match(section, /\{canView && \(/);
  assert.match(ledger, /<h3>Outside Labour Records<\/h3>/);
});

test('tablet/mobile card uses a two-column icon/title grid plus action row', () => {
  const marker = css.indexOf('/* Outside Staff on phones and tablets.');
  assert.ok(marker > -1, 'responsive styles must be present');
  const rules = css.slice(marker);
  assert.match(rules, /@media \(max-width: 767px\)/);
  assert.match(rules, /grid-template-columns:38px minmax\(0, 1fr\)/);
  assert.match(rules, /grid-column:1 \/ -1/);
  assert.match(rules, /min-height:44px/);
});

test('narrow phones show Add Outside Staff as a full-width button', () => {
  const marker = css.indexOf('@media (max-width: 480px)', css.indexOf('/* Outside Staff on phones and tablets.'));
  assert.ok(marker > -1, 'narrow phone styles must be present');
  const narrow = css.slice(marker);
  assert.match(narrow, /\.job-outside-staff-actions \{/);
  assert.match(narrow, /grid-template-columns:minmax\(0, 1fr\)/);
  assert.match(narrow, /\.job-outside-staff-actions button \{\s*min-height:44px;/);
  assert.match(section, /'Add Outside Staff'/);
  assert.doesNotMatch(section, /'View Records'/);
});

test('embedded Outside Labour form is job-bound and renders one field column on mobile', () => {
  assert.match(section, /jobId=\{jobId\}/);
  assert.match(section, /closeAfterSave/);
  assert.match(section, /compactJobMode/);
  assert.match(ledger, /!compactJobMode &&/);
  assert.match(ledger, /\{!compactJobMode && \(/);
  assert.doesNotMatch(ledger, /\(!compactJobMode \|\| !isFormOpen\)/);
  assert.match(ledger, /outsideLabourService\.create/);
  assert.match(css, /\.job-outside-staff-content \.outside-labour-form-grid \{\s*grid-template-columns:minmax\(0, 1fr\)/);
  assert.match(css, /\.job-outside-staff-content \.outside-labour-form-grid \{/);
});
