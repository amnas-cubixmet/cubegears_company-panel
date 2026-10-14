import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  makeQcDraft, resolveQcInspector, qcInspectorForMode, qcFormErrors,
  qcHasErrors, qcPayload, qcSummary
} from '../src/components/jobs/qualityCheckValidation.js';

const read = (path) => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const panel = read('src/components/jobs/JobQualityCheckPanel.jsx');
const workspace = read('src/pages/jobs/JobCardWorkspace.jsx');
const css = read('src/styles/job-quality-check.css');

const approved = () => makeQcDraft({
  inspector: 'QC Technician', inspectorId: 'staff-123',
  testDriveNotes: 'Vehicle road-tested successfully.',
  checklist: [
    { id: 'one', item: 'Engine Check', status: 'Pass' },
    { id: 'two', item: 'Brake Check', status: 'Pass' },
  ]
});

test('empty QC initializes six pending checks and respects saved Django values', () => {
  const blank = makeQcDraft();
  assert.equal(blank.checklist.length, 6);
  assert.ok(blank.checklist.every((item) => item.status === 'Pending'));
  assert.equal(blank.inspector, '');
  const saved = makeQcDraft({
    inspector: 'Aslam', inspectorId: 's1', testDriveNotes: 'Road test OK',
    checklist: [{ item: 'Custom check', status: 'Fail' }]
  }, 'Current User');
  assert.equal(saved.inspector, 'Aslam');
  assert.equal(saved.inspectorId, 's1');
  assert.equal(saved.checklist[0].id, 'QC-1');
  assert.equal(saved.checklist[0].status, 'Fail');
});

test('logged-in inspector is only a fallback; selected staff wins on editable QC', () => {
  assert.equal(resolveQcInspector('', 'Shahin Rahman'), 'Shahin Rahman');
  assert.equal(resolveQcInspector('Unassigned', 'Shahin Rahman'), 'Shahin Rahman');
  assert.equal(resolveQcInspector('Selected Staff', 'Shahin Rahman'), 'Selected Staff');
  assert.equal(makeQcDraft({}, 'Shahin Rahman').inspector, 'Shahin Rahman');
  assert.equal(qcInspectorForMode('Selected Staff', 'Shahin Rahman', true), 'Selected Staff');
  assert.equal(qcInspectorForMode('Selected Staff', 'Shahin Rahman', false), 'Selected Staff');
  assert.equal(qcInspectorForMode('', 'Shahin Rahman', false), '');
  assert.equal(qcInspectorForMode('', 'Shahin Rahman', true), 'Shahin Rahman');
});

test('QC pass validates inspector and requires all items to pass', () => {
  assert.equal(qcHasErrors(qcFormErrors(approved(), 'Pass')), false);
  const missing = approved();
  missing.inspector = '';
  missing.checklist[1].status = 'Pending';
  const errors = qcFormErrors(missing, 'Pass');
  assert.match(errors.inspector, /login account profile/);
  assert.match(errors.items.two, /Mark this check as Pass/);
  assert.equal(qcHasErrors(errors), true);
});

test('QC failure requires failed item, reason and inspector', () => {
  const draft = approved();
  draft.testDriveNotes = '';
  let errors = qcFormErrors(draft, 'Rework Required');
  assert.match(errors.form, /at least one/);
  assert.match(errors.testDriveNotes, /failure or work needed/);
  draft.checklist[1].status = 'Fail';
  draft.testDriveNotes = 'Uneven braking; rework required.';
  errors = qcFormErrors(draft, 'Rework Required');
  assert.equal(qcHasErrors(errors), false);
});

test('incomplete drafts allowed but text remains bounded', () => {
  const draft = makeQcDraft();
  assert.equal(qcHasErrors(qcFormErrors(draft, 'Draft')), false);
  draft.inspector = 'x'.repeat(121);
  draft.testDriveNotes = 'y'.repeat(2001);
  const errors = qcFormErrors(draft, 'Draft');
  assert.match(errors.inspector, /120 characters/);
  assert.match(errors.testDriveNotes, /2,000 characters/);
});

test('QC payload persists staff identity and checklist without phantom values', () => {
  const payload = qcPayload(approved(), 'Pass');
  assert.equal(payload.inspector, 'QC Technician');
  assert.equal(payload.inspectorId, 'staff-123');
  assert.equal(payload.checklist.length, 2);
  assert.equal(payload.testDriveNotes, 'Vehicle road-tested successfully.');
  assert.match(payload.checkDate, /^\d{4}-\d\d-\d\d$/);
  assert.equal(makeQcDraft({ inspector: 'Unassigned' }).inspector, '');
  assert.deepEqual(qcSummary(approved()), { pass: 2, fail: 0, pending: 0, total: 2 });
});

test('QC page uses real searchable staff, handles async login and saves before advancing', () => {
  assert.match(panel, /const \{ user \} = useAuth\(\)/);
  assert.match(panel, /const loggedInName = String\(user\?\.name \|\| ''\)\.trim\(\)/);
  assert.match(panel, /makeQcDraft\(original, loggedInName\)/);
  assert.match(panel, /<QcInspectorPicker/);
  assert.match(panel, /onSelect=\{\(\{ inspector, inspectorId \}\) => change\(\{ inspector, inspectorId \}\)\}/);
  assert.match(panel, /const submissionDraft = \{ \.\.\.draft, inspector: inspectorName \}/);
  assert.match(panel, /qcFormErrors\(submissionDraft, mode\)/);
  assert.match(panel, /await jobService\.updateJob\(job\.id/);
  assert.match(panel, /await jobService\.completeJobStage\(job\.id, 'qc'\)/);
  assert.match(panel, /await onCompleted\?\.\(\)/);
  assert.match(panel, /aria-invalid=\{invalid\}/);
  assert.match(panel, /Save QC Draft/);
  assert.match(panel, /QC Passed/);
  assert.match(panel, /QC Failed/);
  assert.match(css, /@media\(max-width:520px\)/);
});

test('QC workflow cannot bypass form validation with generic stage controls', () => {
  assert.match(workspace, /<JobQualityCheckPanel/);
  assert.match(workspace, /onCompleted=\{\(\) => refreshJobWorkflow\('qc'\)\}/);
  assert.match(workspace, /activeTab !== 'qc'/);
});
