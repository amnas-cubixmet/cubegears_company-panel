import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  validateDocumentTemplateSettings,
  templateApiFieldErrors,
  templateErrorSummary,
} from '../src/utils/documentTemplateValidation.js';

const source = readFileSync(new URL('../src/pages/saas/DocumentTemplates.jsx', import.meta.url), 'utf8');

test('template form highlights errors and shows exact backend field messages', () => {
  assert.match(source, /setFieldErrors\(problems\)/);
  assert.match(source, /aria-invalid=\{Boolean\(fieldErrors\.businessEmail\)\}/);
  assert.match(source, /aria-invalid=\{Boolean\(fieldErrors\.bankAccountNumber\)\}/);
  assert.match(source, /aria-invalid=\{Boolean\(fieldErrors\.customHeader\)\}/);
  assert.match(source, /template-input-error/);
  assert.match(source, /templateApiFieldErrors\(error\)/);
});

test('long template text reports precise field error', () => {
  const errors = validateDocumentTemplateSettings({
    businessName: 'X'.repeat(256),
    customFooter: 'X'.repeat(2001),
    businessAddress: 'X'.repeat(2000),
    bankAccountNumber: '0012345000',
  });
  assert.match(errors.businessName, /255/);
  assert.match(errors.customFooter, /2000/);
  assert.equal(errors.businessAddress, undefined);
  assert.equal(errors.bankAccountNumber, undefined);
});

test('invalid logo and template selection identify their own fields', () => {
  const errors = validateDocumentTemplateSettings({
    businessLogo: 'https://invalid.example/logo.png',
    invoiceTemplate: 'does-not-exist',
    accent: 'not-supported',
  });
  assert.match(errors.businessLogo, /Upload a PNG/);
  assert.match(errors.invoiceTemplate, /valid invoice template/);
  assert.match(errors.accent, /valid accent/);
});

test('Django validation messages are mapped and readable', () => {
  const errors = templateApiFieldErrors({
    data: { businessLogo: ['Logo dimensions must be at most 2048 × 2048.'], businessEmail: ['Invalid email.'] }
  });
  assert.match(errors.businessLogo, /2048/);
  assert.match(templateErrorSummary(errors), /Business Logo/);
  assert.match(templateErrorSummary(errors), /Email: Invalid email/);
});


test('new template fields stay blank and logo size copy is not shown', () => {
  const service = readFileSync(new URL('../src/services/documentTemplates.service.js', import.meta.url), 'utf8');
  for (const key of ['businessName','businessState','businessStateCode','customName','customHeader','customFooter','termsText']) {
    assert.match(service, new RegExp(key + ": ''"));
  }
  assert.doesNotMatch(source, /PNG, JPG or WEBP, up to 250 KB/);
  assert.ok(source.includes('optimizeDocumentLogo(file)'));
  assert.match(source, /preparingLogo/);
});
