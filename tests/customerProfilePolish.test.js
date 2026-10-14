import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  activeCustomerInvoices, customerProfileFinancials, customerInvoiceLabel,
  customerInvoiceTotal, customerInvoiceBalance, customerVisitLabel,
  profileCustomerType, profileMoney,
} from '../src/pages/customers/customerProfile.utils.js';

const profile = readFileSync(new URL('../src/pages/customers/CustomerDetails.jsx', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../src/styles/customer-profile-polished.css', import.meta.url), 'utf8');

test('invoice totals match Django fields without double-counting payments', () => {
  const rows = [
    { kind: 'invoice', status: 'Finalized', total: '12500.00', paid: '3000.00', balance: '9500.00' },
    { kind: 'invoice', status: 'Paid', total: '5500.00', paid: '5500.00', balance: '0.00' },
  ];
  assert.deepEqual(customerProfileFinancials(rows), { billed: 18000, paid: 8500, outstanding: 9500 });
  assert.equal(customerInvoiceTotal(rows[0]), '₹12,500.00');
  assert.equal(customerInvoiceBalance(rows[0]), '₹9,500.00');
});

test('drafts, estimates and cancelled invoices do not inflate billed or due balances', () => {
  const rows = [
    { kind: 'estimate', status: 'Approved', total: 999, paid: 0, balance: 999 },
    { kind: 'invoice', status: 'Draft', total: 200, paid: 0, balance: 200 },
    { kind: 'invoice', status: 'Cancelled', total: 300, paid: 0, balance: 300 },
    { kind: 'invoice', status: 'Paid', total: 100, paid: 100, balance: 0 },
  ];
  assert.equal(activeCustomerInvoices(rows).length, 1);
  assert.deepEqual(customerProfileFinancials(rows), { billed: 100, paid: 100, outstanding: 0 });
});

test('unavailable invoice API and invalid invoice amounts are not rendered as ₹0', () => {
  assert.deepEqual(customerProfileFinancials([], false), { billed: null, paid: null, outstanding: null });
  assert.deepEqual(customerProfileFinancials([{ status: 'Finalized', number: 'INV-1' }]),
    { billed: null, paid: null, outstanding: null });
  assert.equal(profileMoney(null), '—');
  assert.equal(customerInvoiceLabel({ number: 'INV-100' }), 'INV-100');
  assert.equal(customerInvoiceLabel({ invoiceNo: 'OLD-100' }), 'OLD-100');
});

test('profile headers and activity formatting use real data not demo values', () => {
  assert.equal(profileCustomerType('individual'), 'Individual');
  assert.equal(profileCustomerType('business'), 'Business');
  assert.equal(customerVisitLabel({}, []), '—');
  assert.equal(customerVisitLabel({ last_service_date: '2026-10-11' }, []), '11/10/2026');
  assert.match(profile, /customer-profile-hero__main/);
  assert.match(profile, /customer-profile-avatar/);
  assert.match(profile, /customer-profile-hero__contacts/);
  assert.match(profile, /customer-profile-stat__heading/);
  assert.match(profile, /role="tablist"/);
  assert.match(profile, /aria-selected=\{isActive\}/);
  assert.match(profile, /id="customer-profile-sections"/);
  assert.doesNotMatch(profile, /Customer ID:.*customer\.id/);
  assert.doesNotMatch(profile, /Street 1, Main Road/);
  assert.doesNotMatch(profile, /Ajmal K/);
  assert.doesNotMatch(profile, /1,24,500 km'/);
});

test('customer payment modal records real API transaction and refreshes balances', () => {
  assert.match(profile, /paymentService\.createPayment\(\{/);
  assert.match(profile, /customer: customer\.id/);
  assert.match(profile, /invoice: selectedInvoice\.id/);
  assert.match(profile, /amount: amount\.toFixed\(2\)/);
  assert.match(profile, /await loadCustomerData\(\)/);
  assert.match(profile, /paymentSaving \|\| payableInvoices\.length === 0/);
  assert.doesNotMatch(profile, /PAY-\$\{Date\.now\(\)\}/);
  assert.doesNotMatch(profile, /recordedBy: 'Current Staff'/);
});

test('customer profile mobile layout has readable header, actions and stat cards', () => {
  assert.match(styles, /@media\(max-width:767px\)/);
  assert.match(styles, /customer-profile-hero/);
  assert.match(styles, /customer-profile-identity/);
  assert.match(styles, /customer-profile-kpis/);
  assert.match(styles, /customer-profile-tabs__rail/);
  assert.match(styles, /grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(styles, /min-height:43px/);
});

test('every Customer Details JSX icon/component has an imported or declared binding', () => {
  const imports = [...profile.matchAll(/import\s*\{([^}]+)\}\s*from\s*['"][^'"]+['"]/g)]
    .flatMap((match) => match[1].split(',').map((part) => part.trim().split(/\s+as\s+/).at(-1)));
  const locals = [...profile.matchAll(/\b(?:const|let|function)\s+([A-Z][A-Za-z0-9]*)\b/g)]
    .map((match) => match[1]);
  const declared = new Set([...imports, ...locals]);
  const jsxComponents = [...new Set([...profile.matchAll(/<([A-Z][A-Za-z0-9]*)\b/g)]
    .map((match) => match[1]))];
  assert.ok(jsxComponents.includes('Pencil'), 'the Edit Profile Pencil icon must remain present');
  assert.ok(imports.includes('Pencil'), 'Pencil must be imported from lucide-react');
  assert.deepEqual(jsxComponents.filter((tag) => !declared.has(tag)), []);
});
