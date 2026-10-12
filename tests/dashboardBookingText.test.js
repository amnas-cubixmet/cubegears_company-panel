import test from 'node:test';
import assert from 'node:assert/strict';
import { dashboardText, statusClass } from '../src/components/dashboard/dashboard.utils.js';

test('booking service object renders wording rather than a raw object', () => {
  const service = { id: 'CPL-001', description: 'Engine misfire', wording: 'Check engine warning light', status: 'open' };
  assert.equal(dashboardText(service), 'Check engine warning light');
});

test('uses description when service wording is absent', () => {
  assert.equal(dashboardText({ id: 'CPL-002', description: 'Brake inspection', status: 'open' }), 'Brake inspection');
});

test('nested customer and vehicle API objects safely become readable labels', () => {
  assert.equal(dashboardText({ id: 'CUS-11', name: 'Workshop Customer' }), 'Workshop Customer');
  assert.equal(dashboardText({ id: 'VEH-12', registration: 'KL10AB1234' }), 'KL10AB1234');
  assert.equal(dashboardText({ status: 'Pending' }), 'Pending');
});

test('search values and fallback never stringify objects to [object Object]', () => {
  const booking = {
    service: { id: 'CPL-001', description: 'Air filter replacement', status: 'open' },
    customer: { id: 'CUSTOMER-1', name: 'Sam' }
  };
  const searchable = [booking.service, booking.customer]
    .some((value) => dashboardText(value, '').toLowerCase().includes('air filter'));
  assert.equal(searchable, true);
  assert.equal(dashboardText({ unexpected: { nested: true } }, 'Unspecified'), 'Unspecified');
  assert.equal(dashboardText([]), '—');
  assert.equal(dashboardText(null, 'Pending'), 'Pending');
});

test('arrays and primitive dashboard fields remain readable', () => {
  assert.equal(dashboardText(['Oil change', { wording: 'Air filter' }]), 'Oil change, Air filter');
  assert.equal(dashboardText(0), '0');
  assert.equal(dashboardText('  Scheduled  '), 'Scheduled');
  assert.equal(statusClass(dashboardText({ status: 'Confirmed' })), 'is-success');
});
