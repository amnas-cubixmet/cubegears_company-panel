import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (file) => readFileSync(new URL(file, import.meta.url), 'utf8');
const work = read('../src/pages/jobs/JobCardWorkspace.jsx');
const section = read('../src/components/jobs/JobOutsideStaffSection.jsx');
const ledger = read('../src/components/jobs/OutsideLabourPanel.jsx');

test('Work stage exposes a visible Outside Staff section, not hidden More/details only', () => {
  assert.match(work, /<JobOutsideStaffSection jobId=\{job\.id\}\s*\/>/);
  assert.doesNotMatch(work, /<details className="job-work-extra-panel">/);
});

test('Add Outside Staff opens a job-bound Outside Labour form', () => {
  assert.match(section, />Add Outside Staff</);
  assert.match(section, /formOpen=\{formOpen\}/);
  assert.match(section, /jobId=\{jobId\}/);
  assert.match(section, /onFormOpenChange=\{setFormOpen\}/);
  assert.match(section, /closeAfterSave/);
  assert.match(section, /onClick=\{addStaff\}/);
});

test('Expense permissions protect adding outside workers', () => {
  assert.match(section, /hasPermission\(user, 'expenses\.view'\)/);
  assert.match(section, /hasPermission\(user, 'expenses\.create'\)/);
  assert.match(section, /\{canView && canCreate && \(/);
});

test('New close-after-save behavior is scoped to embedded form', () => {
  assert.match(ledger, /closeAfterSave = false/);
  assert.match(ledger, /onFormOpenChange\?\.\(closeAfterSave \? false : Boolean\(jobId\)\)/);
  assert.match(ledger, /outsideLabourService\.create/);
  assert.match(ledger, /outsideLabourService\.markPaid/);
});
