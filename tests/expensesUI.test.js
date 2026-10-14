import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (file) => readFileSync(new URL(file, import.meta.url), 'utf8');
const css = read('../src/styles/expense-management.css');
const page = read('../src/pages/expenses/ExpenseList.jsx');
const list = read('../src/components/expenses/ExpenseListView.jsx');
const tabs = read('../src/components/expenses/ExpenseTabs.jsx');
const header = read('../src/components/expenses/ExpensesHeader.jsx');

const polished = css.slice(css.indexOf('/* Expenses v3'));

test('Expenses v3 is present and scoped to Expenses page', () => {
  assert.ok(polished.startsWith('/* Expenses v3'));
  assert.match(polished, /\.cg-expenses \.expense-dashboard-stats/);
  assert.match(polished, /\.cg-expenses \.expense-dashboard-toolbar/);
  assert.match(polished, /\.cg-expenses \.expense-card-values/);
  assert.match(polished, /\.cg-expenses \.expense-form-grid/);
});

test('Search and category/status dropdowns are readable accessible controls', () => {
  assert.match(list, /type="search" aria-label="Search expenses"/);
  assert.match(list, /aria-label="Filter by expense category"/);
  assert.match(list, /aria-label="Filter by expense status"/);
  assert.match(polished, /\.expense-dashboard-search:focus-within/);
  assert.match(polished, /\.expense-dashboard-search input\[type="search"\]/);
  assert.match(polished, /border:0!important/);
  assert.match(polished, /background:transparent!important/);
  assert.match(polished, /\.expense-dashboard-toolbar > select \{[\s\S]*?height:44px;/);
});

test('Add expense and table actions are explicit and keep original permission checks', () => {
  assert.match(header, /hasPermission\(user,'expenses\.create'\)/);
  assert.match(header, /type="button" className="expense-primary-button"/);
  assert.match(list, /hasPermission\(user,'expenses\.edit'\)/);
  assert.match(list, /hasPermission\(user,'expenses\.delete'\)/);
  assert.match(list, /type="button" onClick=\{\(\)=>onView\(expense\)\}/);
  assert.match(list, /type="button" onClick=\{\(\)=>onEdit\(expense\)\}/);
});

test('Navigation tabs preserve all Expense views with active accessible state', () => {
  assert.match(tabs, /aria-label="Expense views"/);
  assert.match(tabs, /aria-current=\{active===key\?'page':undefined\}/);
  for (const label of ['Overview','All Expenses','Categories','Reports']) assert.ok(tabs.includes(label));
  assert.match(page, /<ExpenseOverviewStats/);
  assert.match(page, /<ExpenseListView/);
  assert.match(page, /<ExpenseForm/);
});

test('Responsive expense layout uses standard readable labels and regular input text', () => {
  assert.match(polished, /\.expense-dashboard-header h1 \{/);
  assert.match(polished, /font-size:23px/);
  assert.match(polished, /\.expense-card__head strong \{/);
  assert.match(polished, /font-size:14px/);
  assert.match(polished, /\.expense-field input,[\s\S]*?font-weight:400!important/);
  assert.match(polished, /@media \(max-width:700px\)/);
  assert.match(polished, /@media \(max-width:380px\)/);
  assert.match(polished, /grid-template-columns:minmax\(0,1fr\)/);
});
