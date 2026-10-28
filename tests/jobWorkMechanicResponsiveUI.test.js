import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(new URL('../'+path, import.meta.url),'utf8');
const mechanic = read('src/components/jobs/JobWorkTimerPanel.jsx');
const styles = read('src/styles/job-work-mechanic-panel.css');
const page = read('src/pages/jobs/JobCardWorkspace.jsx');
const smoke = read('scripts/ui-smoke.mjs');

test('Work tab actually loads Mechanic styles with card/header/form/list selectors', () => {
  assert.match(page,/import '..\/..\/styles\/job-work-mechanic-panel\.css'/);
  for(const name of [
    'job-work-timer-panel','job-work-timer-head','job-work-timer-summary',
    'job-work-timer-form','job-work-timer-hint','job-work-timer-list',
    'job-work-timer-empty','job-work-timer-row','job-work-timer-refresh',
    'job-work-timer-actions','job-work-timer-message',
  ]){
    assert.ok(mechanic.includes(name), 'component missing '+name);
    assert.ok(styles.includes('.'+name), 'CSS missing '+name);
  }
});

test('Mechanic form is a real grid, with Safari-safe text and mobile layout', () => {
  assert.match(styles,/\.job-work-timer-form \{\s*display: grid/);
  assert.match(styles,/\.job-work-timer-head \{\s*display: flex/);
  assert.match(styles,/grid-template-columns: minmax\(0, 1\.25fr\)/);
  assert.match(styles,/font-size: 16px !important/);
  assert.match(styles,/height: 48px !important/);
  assert.match(styles,/@media \(max-width: 900px\)/);
  assert.match(styles,/@media \(max-width: 600px\)/);
  assert.match(styles,/grid-template-columns: minmax\(0, 1fr\)/);
  assert.match(styles,/min-height: 50px !important/);
  assert.match(styles,/prefers-reduced-motion/);
  assert.match(smoke,/Mechanic form layout incomplete/);
});

test('Starting, pausing, completing and approving work are not changed', () => {
  assert.match(mechanic,/payrollService\.startJobWork/);
  assert.match(mechanic,/payrollService\.updateJobWorkSession/);
  for(const action of ['pause','resume','complete','approve','reject','correct']){
    assert.match(mechanic,new RegExp("'"+action+"'"));
  }
  assert.match(mechanic,/disabled=\{Boolean\(busy\) \|\| jobStatus !== 'In Progress' \|\| !assignments\.length\}/);
});
