import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  normalizeCompanyDraft, validateCompanyDraft, formatCompanyApiError,
} from '../src/components/account/companyAccountValidation.js';

test('company profile saves trimmed values and normalized GSTIN', () => {
  assert.deepEqual(normalizeCompanyDraft({
    name: '  Cubix Workshop  ', phone: ' 7025831019 ', email: ' office@example.com ',
    gstNo: '32abcde1234f1z5', address: ' Road 4 ',
  }), {
    name: 'Cubix Workshop', phone: '7025831019', email: 'office@example.com',
    gstNo: '32ABCDE1234F1Z5', address: 'Road 4',
  });
});

test('invalid name email and GST are flagged against their fields', () => {
  const { errors } = validateCompanyDraft({ name: '', email: 'invalid', gstNo: 'INVALID' });
  assert.match(errors.name, /workshop/);
  assert.match(errors.email, /valid company email/);
  assert.match(errors.gstNo, /GSTIN/);
  assert.deepEqual(validateCompanyDraft({
    name: 'Valid Garage', email: 'garage@example.com', gstNo: '32ABCDE1234F1Z5',
  }).errors, {});
});

test('Django validation field details remain visible to the user', () => {
  assert.match(formatCompanyApiError({
    response: {data: {email: ['Enter a valid email address.']}},
  }), /email: Enter a valid email address/);
  assert.equal(formatCompanyApiError(new Error('Connection failed')), 'Connection failed');
});

test('account overview has native real save, validation and responsive UI', () => {
  const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
  const overview = read('../src/components/account/AccountOverview.jsx');
  const css = read('../src/styles/account-overview-refined.css');
  assert.match(overview, /validateCompanyDraft\(draft\)/);
  assert.match(overview, /onSaveCompany\(validated\.draft\)/);
  assert.match(overview, /aria-invalid=\{Boolean\(fieldErrors\[key\]\)\}/);
  assert.match(overview, /formatCompanyApiError\(err\)/);
  assert.match(overview, /role="alert"/);
  assert.match(css, /@media\(max-width:550px\)/);
});
