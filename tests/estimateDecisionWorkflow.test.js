import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const panel = readFileSync(new URL('../src/components/jobs/QuickEstimatePanel.jsx', import.meta.url), 'utf8');
const workspace = readFileSync(new URL('../src/pages/jobs/JobCardWorkspace.jsx', import.meta.url), 'utf8');

test('only an unchanged, latest draft can be approved or rejected', () => {
  assert.ok(panel.includes("latest.status !== 'Draft'"));
  assert.ok(panel.includes("disabled={busy || changed || stale} onClick={reject}"));
  assert.ok(panel.includes('onClick={approve}'));
  assert.ok(panel.includes('Reject Estimate'));
});

test('rejected estimates explain revision workflow and show history without a second reject action', () => {
  assert.ok(panel.includes("latest?.status === 'Rejected'"));
  assert.ok(panel.includes('save a new draft to request approval again'));
  assert.ok(panel.includes('Estimate History'));
  assert.ok(!panel.includes('onReject?.(item.id)'));
});

test('rejection requires confirmation and reports server validation errors', () => {
  assert.ok(workspace.includes("appConfirm('Reject the latest draft estimate?"));
  assert.ok(workspace.includes('jobService.rejectJobEstimate(job.id, estimateKey)'));
  assert.ok(workspace.includes('e?.response?.data?.estimate'));
});
