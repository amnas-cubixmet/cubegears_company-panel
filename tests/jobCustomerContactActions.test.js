import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { cleanPhone, customerContactLinks } from '../src/components/jobs/customerContact.utils.js';

const component = readFileSync(new URL('../src/components/jobs/JobRecordsPanel.jsx', import.meta.url), 'utf8');
const action = readFileSync(new URL('../src/components/jobs/JobCustomerContactActions.jsx', import.meta.url), 'utf8');
const css = readFileSync(new URL('../src/styles/jobs-dashboard.css', import.meta.url), 'utf8');

test('Indian mobile numbers create safe tel and wa.me links', () => {
  assert.deepEqual(customerContactLinks({ customerPhone: '98765 43210' }), {
    callUrl: 'tel:9876543210',
    whatsappUrl: 'https://wa.me/919876543210',
  });
  assert.deepEqual(customerContactLinks({ customerPhone: '+91 98765-43210' }), {
    callUrl: 'tel:+919876543210',
    whatsappUrl: 'https://wa.me/919876543210',
  });
  assert.equal(customerContactLinks({ customerPhone: '(0483) 232 1234' }).callUrl, 'tel:04832321234');
});

test('dedicated WhatsApp number is preferred over customer phone', () => {
  assert.deepEqual(customerContactLinks({
    customerPhone: '98765 43210',
    customerWhatsapp: '+91 90000 00001',
  }), {
    callUrl: 'tel:9876543210',
    whatsappUrl: 'https://wa.me/919000000001',
  });
  assert.equal(customerContactLinks({ customerPhone: '9876543210', customerWhatsapp: 'not a number' }).whatsappUrl,
    'https://wa.me/919876543210');
});

test('invalid or absent numbers never generate clickable contact links', () => {
  assert.equal(cleanPhone('javascript:alert(1)'), '');
  assert.equal(cleanPhone(''), '');
  assert.deepEqual(customerContactLinks({ customerPhone: 'invalid' }), { callUrl: null, whatsappUrl: null });
  assert.deepEqual(customerContactLinks({}), { callUrl: null, whatsappUrl: null });
  assert.equal(customerContactLinks({ customerPhone: '1234567' }).whatsappUrl, null);
});

test('Call and WhatsApp actions are present for desktop and mobile Job Cards', () => {
  assert.equal((component.match(/<JobCustomerContactActions job={job} \/>/g) || []).length, 2);
  assert.match(action, /href={callUrl}/);
  assert.match(action, /href={whatsappUrl}/);
  assert.match(action, /rel="noopener noreferrer"/);
  assert.match(action, /Phone size=\{14\}/);
  assert.match(action, /MessageCircle size=\{14\}/);
  assert.match(css, /jobs-customer-contact-button/);
  assert.match(css, /@media\(max-width:767px\)/);
});

test('mobile contact links are not nested inside a card-wide button', () => {
  assert.match(component, /<article key={job.id} className="jobs-mobile-card">/);
  assert.match(component, /className="jobs-mobile-view-job"/);
  assert.doesNotMatch(component, /<button\s+key={job.id}\s+type="button"\s+className="jobs-mobile-card"/);
});
