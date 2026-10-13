import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  eligibleQcInspectors, searchQcInspectors, qcInspectorDuplicate, validateNewQcInspector,
} from '../src/components/jobs/qcInspectorPicker.utils.js';
import { makeQcDraft, qcPayload } from '../src/components/jobs/qualityCheckValidation.js';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const picker = read('../src/components/jobs/QcInspectorPicker.jsx');
const qcPanel = read('../src/components/jobs/JobQualityCheckPanel.jsx');
const workspace = read('../src/pages/jobs/JobCardWorkspace.jsx');
const style = read('../src/styles/job-quality-check.css');

const staff = [
  { id: 's-2', name: 'Sreejith', designation: 'QC Inspector', employmentStatus: 'Active', employeeId: 'EMP-22' },
  { id: 's-1', name: 'Anas', designation: 'Mechanic', employmentStatus: 'Active', employeeId: 'EMP-11' },
  { id: 's-3', name: 'Ajmal', designation: 'Helper', employmentStatus: 'Inactive' },
  { id: 's-4', name: '', designation: 'Mechanic', employmentStatus: 'Active' },
];

test('QC Inspector search includes active named staff and allows designation/employee number query', () => {
  const result = eligibleQcInspectors(staff);
  assert.deepEqual(result.map((item) => item.name), ['Anas', 'Sreejith']);
  assert.equal(searchQcInspectors(staff, 'qc').length, 1);
  assert.equal(searchQcInspectors(staff, 'EMP-11')[0].name, 'Anas');
  assert.equal(searchQcInspectors(staff, 'sree')[0].id, 's-2');
  assert.equal(searchQcInspectors(staff, 'no match').length, 0);
  assert.equal(searchQcInspectors([], '').length, 0);
});

test('New QC Inspector checks duplicate staff names and real input constraints', () => {
  assert.equal(qcInspectorDuplicate(staff, '  sreejith   ')?.id, 's-2');
  assert.equal(qcInspectorDuplicate(staff, 'Another Inspector'), null);
  assert.deepEqual(validateNewQcInspector('New Inspector', '+91 98765 43210'), {});
  assert.deepEqual(validateNewQcInspector('New Inspector', ''), {});
  assert.match(validateNewQcInspector(' ').name, /Enter inspector name/);
  assert.match(validateNewQcInspector('x'.repeat(121)).name, /120 characters/);
  assert.match(validateNewQcInspector('New Inspector', 'abcd').phone, /valid phone number/);
});

test('selected staff identity persists in QC JSON and old name-only QC entries still display', () => {
  const selected = makeQcDraft({ inspector: 'Anas', inspectorId: 's-1' });
  assert.equal(selected.inspector, 'Anas');
  assert.equal(selected.inspectorId, 's-1');
  const saved = qcPayload(selected, 'Pending');
  assert.equal(saved.inspector, 'Anas');
  assert.equal(saved.inspectorId, 's-1');
  assert.equal(makeQcDraft({ inspector: 'Legacy Worker' }).inspector, 'Legacy Worker');
  assert.equal(makeQcDraft({ inspector: 'Unassigned' }).inspector, '');
});

test('QC Inspector picker supports Search & Select and Add New staff profile', () => {
  assert.match(picker, /role="combobox"/);
  assert.match(picker, /aria-expanded=\{opened\}/);
  assert.match(picker, /searchQcInspectors\(staff, query\)/);
  assert.match(picker, /onSelect\(\{ inspector: person.name, inspectorId: String\(person.id\) \}\)/);
  assert.match(picker, /Add New QC Inspector/);
  assert.match(picker, /Add New Inspector/);
  assert.match(picker, /<ResponsiveModalSheet/);
  assert.match(picker, /await staffService\.createStaff\(/);
  assert.match(picker, /designation: 'QC Inspector'/);
  assert.match(picker, /onStaffCreated\?\.\(saved\)/);
  assert.match(picker, /This inspector already exists/);
  assert.match(picker, /staff creation permissions/);
  assert.match(picker, /Save & Select Inspector/);
});

test('QC page uses staff list and inspector select without old free text box', () => {
  assert.match(qcPanel, /<QcInspectorPicker/);
  assert.match(qcPanel, /onSelect=\{\(\{ inspector, inspectorId \}\) => change\(\{ inspector, inspectorId \}\)\}/);
  assert.match(workspace, /staff=\{staff\}/);
  assert.match(workspace, /onStaffCreated=\{\(newInspector\) => setStaff/);
  assert.doesNotMatch(qcPanel, /placeholder="Enter inspector name"/);
  assert.match(style, /job-qc-inspector-results/);
  assert.match(style, /job-qc-add-inspector-form/);
  assert.match(style, /@media\(max-width:520px\)/);
});
