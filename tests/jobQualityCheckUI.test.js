import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  makeQcDraft, resolveQcInspector, qcFormErrors, qcHasErrors, qcPayload, qcSummary,
} from '../src/components/jobs/qualityCheckValidation.js';

const panel = readFileSync(new URL('../src/components/jobs/JobQualityCheckPanel.jsx', import.meta.url), 'utf8');
const workspace = readFileSync(new URL('../src/pages/jobs/JobCardWorkspace.jsx', import.meta.url), 'utf8');
const css = readFileSync(new URL('../src/styles/job-quality-check.css', import.meta.url), 'utf8');

const passedDraft = () => makeQcDraft({
  inspector: 'QC Technician',
  testDriveNotes: 'Vehicle road-tested and found satisfactory.',
  checklist: [
    { id: 'one', item: 'Engine Check', status: 'Pass' },
    { id: 'two', item: 'Brake Check', status: 'Pass' },
  ],
});

test('QC safely initializes missing checklist and saved Django qc notes', () => {
  const draft = makeQcDraft();
  assert.equal(draft.checklist.length, 6);
  assert.ok(draft.checklist.every((item) => item.status === 'Pending'));
  assert.equal(draft.inspector, '');
  const saved = makeQcDraft({ inspector: 'Aslam', testDriveNotes: 'Road test OK',
    checklist: [{ item: 'Custom check', status: 'Fail' }] });
  assert.equal(saved.testDriveNotes, 'Road test OK');
  assert.equal(saved.inspector, 'Aslam');
  assert.equal(saved.checklist[0].id, 'QC-1');
  assert.equal(saved.checklist[0].status, 'Fail');
});

test('QC Passed needs inspector and every item marked Pass', () => {
  const draft = passedDraft();
  assert.equal(qcHasErrors(qcFormErrors(draft, 'Pass')), false);
  const missing = { ...draft, inspector: '', checklist: [
    draft.checklist[0], { ...draft.checklist[1], status: 'Pending' },
  ] };
  const errors = qcFormErrors(missing, 'Pass');
  assert.match(errors.inspector, /inspector name/i);
  assert.match(errors.items.two, /Mark this check as Pass/);
  assert.equal(qcHasErrors(errors), true);
});

test('QC Failed requires at least one failed check, reason and inspector', () => {
  const draft = { ...passedDraft(), testDriveNotes: '' };
  let errors = qcFormErrors(draft, 'Rework Required');
  assert.match(errors.form, /at least one/i);
  assert.match(errors.testDriveNotes, /failure or work needed/i);
  draft.checklist[1].status = 'Fail';
  draft.testDriveNotes = 'Brake balance uneven; rework required.';
  errors = qcFormErrors(draft, 'Rework Required');
  assert.equal(errors.form, '');
  assert.equal(qcHasErrors(errors), false);
});

test('drafts may contain incomplete checks but reject excessive text', () => {
  const draft = makeQcDraft();
  assert.equal(qcHasErrors(qcFormErrors(draft, 'Draft')), false);
  draft.inspector = 'x'.repeat(121);
  draft.testDriveNotes = 'y'.repeat(2001);
  const invalid = qcFormErrors(draft, 'Draft');
  assert.match(invalid.inspector, /120 characters/);
  assert.match(invalid.testDriveNotes, /2,000 characters/);
});

test('QC payload preserves valid status/notes, no phantom demo inspector', () => {
  const draft = passedDraft();
  const payload = qcPayload(draft, 'Pass');
  assert.equal(payload.inspector, 'QC Technician');
  assert.equal(payload.status, 'Pass');
  assert.equal(payload.checklist.length, 2);
  assert.equal(payload.checklist[0].item, 'Engine Check');
  assert.equal(payload.testDriveNotes, 'Vehicle road-tested and found satisfactory.');
  assert.match(payload.checkDate, /^\d{4}-\d\d-\d\d$/);
  assert.equal(makeQcDraft({ inspector: 'Unassigned' }).inspector, '');
  assert.deepEqual(qcSummary(draft), { pass: 2, fail: 0, pending: 0, total: 2 });
});

test('QC controls use local changes, validate, save, then advance workflow', () => {
  assert.match(panel, /setDraft\(\(current\) => \(\{ \.\.\.current, \.\.\.update \}\)\)/);
  assert.match(panel, /await jobService\.updateJob\(job\.id/);
  assert.match(panel, /await jobService\.completeJobStage\(job\.id, 'qc'\)/);
  assert.match(panel, /await onCompleted\?\.\(\)/);
  assert.match(panel, /requestAnimationFrame\(\(\) =>/);
  assert.match(panel, /aria-invalid=\{invalid\}/);
  assert.match(panel, /QC Passed/);
  assert.match(panel, /QC Failed/);
  assert.match(panel, /Save QC Draft/);
  assert.match(css, /@media\(max-width:520px\)/);
});

test('QC page cannot bypass its validation through the generic stage button', () => {
  assert.match(workspace, /<JobQualityCheckPanel/);
  assert.match(workspace, /onCompleted=\{\(\) => refreshJobWorkflow\('qc'\)\}/);
  assert.match(workspace, /activeTab !== 'qc'/);
  assert.doesNotMatch(workspace, /setQcRoadTest|completeQc\('Pass'\)|updateQcItem/);
});


test('new Quality Check defaults inspector to the login account name', () => {
  assert.equal(resolveQcInspector('', 'Shahin Rahman'), 'Shahin Rahman');
  assert.equal(makeQcDraft({}, 'Shahin Rahman').inspector, 'Shahin Rahman');
  assert.equal(makeQcDraft({ inspector: 'Unassigned' }, 'Shahin Rahman').inspector, 'Shahin Rahman');
  const qc = makeQcDraft({ inspector: '', checklist: [{ item: 'Brakes', status: 'Pass' }] }, 'Shahin Rahman');
  assert.equal(qc.inspector, 'Shahin Rahman');
  assert.equal(qc.checklist[0].status, 'Pass');
});

test('saved inspector is not overwritten by a different logged-in user', () => {
  assert.equal(resolveQcInspector('Afsal K', 'Shahin Rahman'), 'Afsal K');
  assert.equal(makeQcDraft({ inspector: 'Afsal K' }, 'Shahin Rahman').inspector, 'Afsal K');
  assert.equal(makeQcDraft({ inspector: 'Afsal K' }, '').inspector, 'Afsal K');
  assert.equal(makeQcDraft({}, '').inspector, '');
});

test('QC inspector is readonly, driven by AuthContext, never job advisor or manually changed', () => {
  assert.match(panel, /import \{ useAuth \} from '\.\.\/\.\.\/hooks\/useAuth';/);
  assert.match(panel, /const \{ user \} = useAuth\(\)/);
  assert.match(panel, /const loggedInName = String\(user\?\.name \|\| ''\)\.trim\(\)/);
  assert.match(panel, /makeQcDraft\(savedQc, loggedInName\)/);
  assert.match(panel, /if \(!loggedInName\) return;/);
  assert.match(panel, /current\.inspector\s*\?\s*current : \{ \.\.\.current, inspector: loggedInName \}/);
  assert.match(panel, /value=\{draft\.inspector\} readOnly/);
  assert.doesNotMatch(panel, /onChange=\{\(event\) => change\(\{ inspector:/);
  assert.match(panel, /Auto-filled from the logged-in account/);
});
