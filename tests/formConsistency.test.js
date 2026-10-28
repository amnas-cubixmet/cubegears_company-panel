import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { defaultFormPlaceholder } from '../src/utils/formPlaceholders.js';

const read = (file) => readFileSync(new URL(file, import.meta.url), 'utf8');

test('form placeholders give familiar examples for common customer and billing fields', () => {
  assert.equal(defaultFormPlaceholder({ type: 'email', label: 'Email' }), 'name@example.com');
  assert.equal(defaultFormPlaceholder({ type: 'tel', label: 'Mobile number' }), '+91 98765 43210');
  assert.equal(defaultFormPlaceholder({ label: 'GST Number' }), 'GSTIN / URP');
  assert.equal(defaultFormPlaceholder({ label: 'Vehicle registration number' }), 'e.g. KL 10 AB 1234');
  assert.equal(defaultFormPlaceholder({ label: 'Quantity' }), 'e.g. 1');
  assert.equal(defaultFormPlaceholder({ kind: 'textarea', label: 'Notes' }), 'Write notes');
});

test('placeholders preserve intentional blanks for controls that do not support text hints', () => {
  for (const type of ['checkbox', 'radio', 'file', 'hidden', 'date', 'submit']) {
    assert.equal(defaultFormPlaceholder({ type, label: 'Customer' }), '', type);
  }
});

test('global form behavior fills newly mounted forms and scrolls to the first invalid visible field', () => {
  const global = read('../src/components/common/GlobalFormValidation.jsx');
  assert.match(global, /addDefaultFormPlaceholders\(document\)/);
  assert.match(global, /addDefaultFormPlaceholders\(node\)/);
  assert.match(global, /attributeFilter: \['aria-invalid', 'data-cg-error-active'\]/);
  assert.match(global, /candidate\.getClientRects\(\)\.length > 0/);
  assert.match(global, /focusField\(first\)/);
});

test('form controls share touch sizing, mobile text sizing, and keyboard focus visibility', () => {
  const css = read('../src/styles/form-controls-unified.css');
  assert.match(css, /form select\) \{\s*min-height: 44px/);
  assert.match(css, /form textarea\) \{\s*min-height: 96px/);
  assert.match(css, /form select, form textarea\) \{\s*font-size: 16px/);
  assert.match(css, /form button, form input\[type="submit"\]/);
  assert.match(css, /outline: 2px solid var\(--primary\)/);
});
