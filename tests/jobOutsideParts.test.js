import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const panel = readFileSync(new URL('../src/components/jobs/OutsidePartsPanel.jsx', import.meta.url), 'utf8');
const workflow = readFileSync(new URL('../src/pages/jobs/JobPartsWorkflow.jsx', import.meta.url), 'utf8');
test('outside parts form is on existing job parts page', () => {
 assert.match(workflow, /<OutsidePartsPanel jobId=\{jobId\}\/>/);
 assert.match(panel, /Outside Parts — Buy & Use/);
});
test('outside purchased parts use a dedicated job API and do not touch inventory', () => {
 assert.match(panel, /outside-parts/);
 assert.match(panel, /unitCost/);
 assert.match(panel, /sellingPrice/);
 assert.match(panel, /requestId/);
 assert.doesNotMatch(panel, /issueStock\(|receiveStock\(/);
});
test('outside part save requires valid inputs and permissions', () => {
 assert.match(panel, /hasPermission\(user, 'jobs.edit'\)/);
 assert.match(panel, /qty <= 0/);
 assert.match(panel, /cost < 0/);
 assert.match(panel, /price < 0/);
 assert.match(panel, /disabled=\{busy\}/);
});
