import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  normalizeOwnerCompanyDraft, validateOwnerCompanyDraft, extractOwnerCompanyApiErrors,
  OWNER_COMPANY_FIELDS,
} from '../src/pages/saas/ownerCompanyValidation.js';

const read = (path) => readFileSync(new URL('../' + path, import.meta.url), 'utf8');

test('shop fields normalize cleanly and never leak unrelated API values', () => {
  assert.equal(OWNER_COMPANY_FIELDS.length, 10);
  assert.deepEqual(normalizeOwnerCompanyDraft({
    name: '  My Garage ', email: ' TEST@EXAMPLE.COM ', gstin: ' 32abcde1234f1z5 ',
    phone: ' +91 99999 99999 ', pincode: ' 673001 ', extra: 'do not submit',
  }), {
    name: 'My Garage', legal_name: '', email: 'test@example.com',
    phone: '+91 99999 99999', gstin: '32ABCDE1234F1Z5',
    address: '', city: '', state: '', country: '', pincode: '673001',
  });
});

test('invalid shop name, email, phone, GSTIN and India PIN show field-specific errors', () => {
  const { errors } = validateOwnerCompanyDraft({
    name: ' ', email: 'not-an-email', phone: 'wrong', gstin: 'invalid',
    country: 'India', pincode: 'abc',
  });
  for (const key of ['name', 'email', 'phone', 'gstin', 'pincode']) {
    assert.ok(errors[key], key + ' should have its own message');
  }
});

test('valid company fields and matching GSTIN state pass', () => {
  const { errors, draft } = validateOwnerCompanyDraft({
    name: 'Garage One', legal_name: 'Garage One Pvt Ltd',
    email: 'contact@example.com', phone: '+91 70258 31019',
    gstin: '32abcde1234f1z5', state: 'Kerala', country: 'India',
    city: 'Malappuram', pincode: '676505',
  });
  assert.deepEqual(errors, {});
  assert.equal(draft.gstin, '32ABCDE1234F1Z5');
});

test('GSTIN state mismatch is shown on State, never silently saved', () => {
  const { errors } = validateOwnerCompanyDraft({
    name: 'Garage One', state: 'Tamil Nadu', gstin: '32ABCDE1234F1Z5',
  });
  assert.match(errors.state, /GSTIN state code/);
});

test('optional fields may be blank; non-Indian postal codes are accepted', () => {
  assert.deepEqual(validateOwnerCompanyDraft({name: 'Garage One'}).errors, {});
  assert.deepEqual(validateOwnerCompanyDraft({
    name: 'Outside', country: 'United Kingdom', pincode: 'SW1A 1AA',
  }).errors, {});
});

test('Django field errors are mapped under matching inputs', () => {
  const actual = extractOwnerCompanyApiErrors({
    status: 400,
    data: { email: ['Enter a valid email address.'], gstin: ['Invalid GSTIN.'] },
  });
  assert.equal(actual.fieldErrors.email, 'Enter a valid email address.');
  assert.equal(actual.fieldErrors.gstin, 'Invalid GSTIN.');
  assert.equal(actual.message, '');
  const generic = extractOwnerCompanyApiErrors({
    response: { data: { non_field_errors: ['Unable to modify this company.'] } },
  });
  assert.match(generic.message, /Unable to modify this company/);
  assert.equal(extractOwnerCompanyApiErrors(new Error('Connection failed')).message, 'Connection failed');
});

test('/account/company renders accessible inline errors and blocks invalid submissions', () => {
  const page = read('src/pages/saas/OwnerCompanyProfile.jsx');
  const routes = read('src/routes/AppRoutes.jsx');
  const css = read('src/styles/owner-company-profile.css');
  assert.match(routes, /path="\/account\/company" element=\{<OwnerCompanyProfile/);
  assert.match(page, /validateOwnerCompanyDraft\(values\)/);
  assert.match(page, /if \(Object\.keys\(errors\)\.length\)/);
  assert.match(page, /extractOwnerCompanyApiErrors\(err\)/);
  assert.match(page, /aria-invalid=\{Boolean\(fieldErrors\[key\]\)\}/);
  assert.match(page, /aria-describedby=\{fieldErrors\[key\]/);
  assert.match(page, /onBlur=\{\(\) => blurField\(key\)\}/);
  assert.match(page, /focusFirstError\(errors\)/);
  assert.match(page, /className="owner-company-field-error"/);
  assert.match(page, /apiClient\.patch\('\/company\/me', draft\)/);
  assert.match(page, /noValidate/);
  assert.match(css, /@media\(max-width:720px\)/);
});
