import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(new URL('../'+path,import.meta.url),'utf8');

test('Stock existing-products search is a flat focusable control with no nested borders',()=>{
  const page=read('src/pages/stock/StockEasyPage.jsx');
  const styles=read('src/styles/stock-form-polish.css');
  assert.match(page,/className="cg-easy-picker-search"/);
  assert.match(page,/placeholder="Search existing products\.\.\."/);
  assert.match(styles,/\.cg-easy-stock \.cg-easy-form \.cg-easy-picker-search \{[\s\S]*?border: 0 !important;[\s\S]*?outline: 0 !important;[\s\S]*?box-shadow: none !important/);
  assert.match(styles,/\.cg-easy-picker-search:focus-within \{[\s\S]*?outline: 0 !important;[\s\S]*?background: color-mix\(/);
  assert.match(styles,/\.cg-easy-picker-search > input:not\(\[type="radio"\]\):not\(\[type="checkbox"\]\):focus-visible \{/);
  assert.match(styles,/\.cg-easy-picker-search > input:not\(\[type="radio"\]\):not\(\[type="checkbox"\]\):focus-visible \{[\s\S]*?outline: 0 !important/);
});

test('Add Workshop Customer retains borderless fields and a visible non-border focus tint',()=>{
  const page=read('src/pages/customers/CustomerList.jsx');
  const styles=read('src/styles/customer-workshop-form.css');
  assert.match(page,/Add Workshop Customer/);
  assert.match(styles,/\.customer-directory-form \[data-cg-input-shell="true"\] \{/);
  assert.match(styles,/\.customer-directory-form \[data-cg-input-shell="true"\]:focus-within \{[\s\S]*?outline: 0 !important;[\s\S]*?background: color-mix\(/);
  assert.match(styles,/\.customer-directory-form textarea:focus-visible \{[\s\S]*?outline: 0 !important;[\s\S]*?background: color-mix\(/);
  assert.match(styles,/background: var\(--danger-soft/);
});

test('style scope does not remove borders globally from validations or other forms',()=>{
  const stock=read('src/styles/stock-form-polish.css');
  const customer=read('src/styles/customer-workshop-form.css');
  assert.match(stock,/\.cg-easy-stock \.cg-easy-form \.cg-easy-picker-search/);
  assert.match(customer,/:is\(#root, body\) \.customer-directory-form/);
  assert.doesNotMatch(stock,/^\s*input\s*\{\s*border:0/m);
});
