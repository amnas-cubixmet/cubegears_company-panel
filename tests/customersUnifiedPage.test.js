import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const routes = readFileSync(new URL('../src/routes/AppRoutes.jsx', import.meta.url), 'utf8');
const tabs = readFileSync(new URL('../src/components/customers/CustomerManagementTabs.jsx', import.meta.url), 'utf8');
const directory = readFileSync(new URL('../src/pages/customers/CustomerList.jsx', import.meta.url), 'utf8');

test('customers entry route renders one summary and directory page', () => {
  assert.match(routes, /path="\/customers" element={<CustomerList \/>}/);
  assert.match(routes, /path="\/customers\/overview" element={<Navigate to="\/customers" replace \/>}/);
  assert.match(routes, /path="\/customers\/all" element={<Navigate to="\/customers" replace \/>}/);
  assert.match(routes, /path="\/customers\/:id" element={<CustomerDetails \/>}/);
});

test('customer tabs no longer duplicate Overview and All Customers', () => {
  assert.match(tabs, /label: 'Customers', path: '\/customers'/);
  assert.doesNotMatch(tabs, /path: '\/customers\/overview'/);
  assert.doesNotMatch(tabs, /path: '\/customers\/all'/);
  assert.doesNotMatch(tabs, /path: '\/customers\/new'/);
  assert.match(tabs, /end={path === '\/customers'}/);
  assert.match(tabs, /\/customers\/service-history/);
});

test('main Customers page includes summary cards, filters and desktop/mobile lists', () => {
  assert.match(directory, /Total Customers/);
  assert.match(directory, /Active Customers/);
  assert.match(directory, /New This Month/);
  assert.match(directory, /Outstanding/);
  assert.match(directory, /All Customers/);
  assert.match(directory, /customer-directory-list-heading/);
  assert.match(directory, /desktop-customers-table/);
  assert.match(directory, /mobile-customers-cards/);
  assert.equal((directory.match(/visibleCustomers\.map\(\(c\) => \(/g)||[]).length,2);
});

test('customer search and status filters do not re-fetch all linked resources on each keystroke', () => {
  assert.match(directory, /useMemo\(\(\) =>/);
  assert.match(directory, /customer\.__vehicles\?\.some/);
  assert.match(directory, /customer\.__jobs\?\.some/);
  assert.match(directory, /\[customers, search, statusFilter, branchFilter, typeFilter\]/);
  assert.match(directory, /fetchCustomers\(\);\s*}, \[\]\);/);
});

test('Add Customer on directory opens modal instead of separate route', () => {
  assert.match(directory, /onClick={openAddModal}/);
  assert.match(directory, /isOpen={isAddCustomerOpen}/);
  assert.match(directory, /checkDuplicateCustomer\(payload\)/);
  assert.doesNotMatch(directory, /navigate\('\/customers\/new'\)/);
});
