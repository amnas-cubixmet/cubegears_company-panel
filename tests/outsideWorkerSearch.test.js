import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const src = readFileSync(new URL('../src/components/jobs/OutsideLabourPanel.jsx', import.meta.url), 'utf8');
const css = readFileSync(new URL('../src/styles/outside-labour-dashboard.css', import.meta.url), 'utf8');
test('outside worker name searches company-scoped records without creating employees', () => {
  assert.match(src, /setKnownWorkers\(await outsideLabourService\.list\(\)\)/);
  assert.match(src, /workerSuggestions = useMemo/);
  assert.match(src, /Search or enter new worker name/);
  assert.match(src, /selectWorker\(worker\)/);
});
test('worker selection fills name and phone without submitting form', () => {
  assert.match(src, /workerName: worker\.name, workerPhone: worker\.phone/);
  assert.match(src, /type="button" role="option"/);
  assert.match(src, /name="workerName" required/);
  assert.match(src, /outsideLabourService\.create/);
});
test('worker picker is styled responsively with regular-weight fields', () => {
  assert.match(css, /outside-worker-search-field input/);
  assert.match(css, /font-weight:400!important/);
  assert.match(css, /min-width:0/);
});
