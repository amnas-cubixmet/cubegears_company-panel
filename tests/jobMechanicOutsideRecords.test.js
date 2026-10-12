import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const section = read('../src/components/jobs/JobOutsideStaffSection.jsx');
const outside = read('../src/components/jobs/OutsideLabourPanel.jsx');
const mechanic = read('../src/components/jobs/JobWorkTimerPanel.jsx');
const workspace = read('../src/pages/jobs/JobCardWorkspace.jsx');

test('Job Work shows Outside Labour Records immediately without a View Records toggle', () => {
  assert.match(section, /\{canView && \(\s*<div className="job-outside-staff-content">/);
  assert.match(section, /<OutsideLabourPanel/);
  assert.match(section, /showRecordsWhileEditing/);
  assert.doesNotMatch(section, /toggleRecords|['"]View Records['"]|const \[expanded/);
  assert.match(outside, /<h3>Outside Labour Records<\/h3>/);
  assert.match(outside, /\(!compactJobMode \|\| !isFormOpen \|\| showRecordsWhileEditing\)/);
});

test('Outside Staff Add, expenses/payment and records filters remain functional', () => {
  assert.match(section, /onClick=\{addStaff\}/);
  assert.match(section, /hasPermission\(user, 'expenses\.create'\)/);
  assert.match(outside, /outsideLabourService\.markPaid/);
  assert.match(outside, /\['All', 'Pending', 'Paid'\]/);
  assert.match(outside, /visibleRows\.map/);
});

test('Technician Work Timers is renamed Mechanic and lists mechanic name first', () => {
  assert.match(mechanic, /<h3><Wrench[^>]*\/> Mechanic<\/h3>/);
  assert.doesNotMatch(mechanic, /> Technician Work Timers</);
  assert.match(mechanic, /<strong>\{row\.staffName \|\| 'Mechanic'\}<\/strong>/);
  assert.match(mechanic, /row\.serviceName \|\| 'Work'/);
});

test('Mechanic work timer actions and Job Card placement remain unchanged', () => {
  assert.match(mechanic, /'pause'/);
  assert.match(mechanic, /'resume'/);
  assert.match(mechanic, /'complete'/);
  assert.match(mechanic, /'approve'/);
  const stage = workspace.slice(workspace.indexOf("{activeTab === 'work' && ("), workspace.indexOf("{activeTab === 'parts' && ("));
  assert.ok(stage.indexOf('<JobOutsideStaffSection') < stage.indexOf('<JobWorkTimerPanel'));
});
