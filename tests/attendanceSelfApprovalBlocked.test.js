import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const page = read('src/pages/attendance-manager/LeaveRequestsManager.jsx');
const css = read('src/styles/attendance-manager-readable.css');

test('self-owned pending leave cannot show Approve / Reject controls when API says canReview false', () => {
  assert.match(page,/item.status === 'Pending' && item.canReview === false/);
  assert.match(page,/className="am-approval-blocked-note" role="status"/);
  assert.match(page,/item.reviewBlockReason/);
  assert.match(page, /: item.status === 'Pending' \? \(/);
});

test('form never submits blocked self approval even if modal was opened earlier', () => {
  assert.match(page,/if \(selected.canReview === false\) \{/);
  assert.match(page,/setApprovalError\(selected.reviewBlockReason/);
  assert.ok(page.indexOf("if (selected.canReview === false)") <
    page.indexOf("await attendanceManagerService.updateApprovalStatus"));
});

test('API 403 message is propagated to manager without a generic error', () => {
  assert.match(page,/error\?\.data\?\.message/);
  assert.match(page,/error\?\.response\?\.data\?\.message/);
  assert.match(page,/error\?\.message/);
});

test('blocked note is readable and leaves approval endpoints unchanged', () => {
  assert.match(css,/\.am-approval-blocked-note/);
  assert.match(css,/font-size: 14px !important/);
  assert.match(page,/attendanceManagerService.updateApprovalStatus\(/);
  assert.doesNotMatch(page,/allowSelfApproval:\s*true/);
});
