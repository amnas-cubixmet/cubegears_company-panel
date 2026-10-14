import test from 'node:test';
import assert from 'node:assert/strict';
import { complaintStatusForJob, complaintStatusClass } from '../src/components/jobs/complaintStatus.js';

test('complaints stay Open during Overview, Inspection and Estimate', () => {
  for (const status of ['New', 'Inspection', 'Estimate Pending']) {
    assert.equal(complaintStatusForJob({ status }), 'Open');
  }
  assert.equal(complaintStatusForJob({ status: 'New' }, { completed: ['overview', 'inspection'] }), 'Open');
});

test('complaints automatically become In Progress when Work starts', () => {
  for (const status of ['Approved', 'In Progress', 'Waiting for Parts', 'QC']) {
    assert.equal(complaintStatusForJob({ status }), 'In Progress');
  }
  assert.equal(complaintStatusForJob({ status: 'New' }, { completed: ['overview', 'inspection', 'estimate'] }), 'In Progress');
});

test('complaints complete only after Quality Check has passed and finished', () => {
  for (const status of ['Ready for Delivery', 'Delivered']) {
    assert.equal(complaintStatusForJob({ status }), 'Completed');
  }
  assert.equal(complaintStatusForJob({ status: 'QC' }, { completed: ['overview', 'inspection', 'estimate', 'work', 'qc'] }), 'Completed');
  assert.equal(complaintStatusForJob({ status: 'QC' }, { completed: ['overview', 'inspection', 'estimate', 'work'] }), 'In Progress');
});

test('each auto-status has a stable badge style', () => {
  assert.equal(complaintStatusClass('Open'), 'is-open');
  assert.equal(complaintStatusClass('In Progress'), 'is-progress');
  assert.equal(complaintStatusClass('Completed'), 'is-completed');
});
