import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../src/styles/form-typography.css', import.meta.url), 'utf8');
const app = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8');
const input = readFileSync(new URL('../src/components/ui/Input.jsx', import.meta.url), 'utf8');
const select = readFileSync(new URL('../src/components/ui/Select.jsx', import.meta.url), 'utf8');

test('global typography CSS is imported after legacy page styles', () => {
  const importedStyles = [...app.matchAll(/import ['"]\.\/styles\/([^'"]+\.css)['"];/g)]
    .map((match) => match[1]);
  assert.deepEqual(importedStyles.slice(-3), [
    'form-typography.css', 'form-controls-unified.css', 'form-errors-unified.css'
  ]);
});

test('editable inputs, native selects and textareas use regular weight', () => {
  assert.match(css, /:is\(body, #root\)/);
  assert.match(css, /input:not\(\[type="checkbox"\]\)/);
  assert.match(css, /textarea,/);
  assert.match(css, /select,/);
  assert.match(css, /option,/);
  assert.match(css, /font-weight:\s*400\s*!important/);
});

test('form text reset excludes action buttons and checkbox or radio controls', () => {
  for (const type of ['checkbox', 'radio', 'file', 'button', 'submit', 'reset', 'image']) {
    assert.ok(css.includes(`:not([type="${type}"])`), `input type ${type} must be excluded`);
  }
  assert.ok(!/\n\s*button[,\s{]/.test(css), 'Do not restyle all buttons');
});

test('input and textarea placeholders and custom dropdowns are regular', () => {
  assert.match(css, /input[^\n]*::placeholder/);
  assert.match(css, /textarea::placeholder/);
  assert.match(css, /\[role="combobox"\]/);
  assert.match(css, /\[role="option"\]/);
  assert.match(css, /\.searchable-select-wrapper \.form-control > span:first-child/);
});

test('shared Input/Select components do not introduce font-medium', () => {
  assert.match(input, /text-\[13px\] font-normal text-content/);
  assert.match(select, /text-\[13px\] font-normal text-content/);
});
