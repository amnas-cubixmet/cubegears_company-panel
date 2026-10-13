import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { customerContactLinks } from '../src/components/jobs/customerContact.utils.js';

const source = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const tabs = source('../src/components/customers/CustomerManagementTabs.jsx');
const routes = source('../src/routes/AppRoutes.jsx');
const list = source('../src/pages/customers/CustomerList.jsx');
const profile = source('../src/pages/customers/CustomerDetails.jsx');
const buttons = source('../src/components/customers/CustomerContactActions.jsx');
const css = source('../src/styles/customer-management.css');

test('four legacy customer routes redirect to the directory, profile remains available', () => {
  for (const section of ['service-history', 'outstanding', 'reminders', 'reports']) {
    assert.match(routes, new RegExp('path="/customers/' + section + '" element={<Navigate to="/customers" replace />}'));
    assert.doesNotMatch(tabs, new RegExp('/customers/' + section));
  }
  assert.match(routes, /path="\/customers\/:id" element={<CustomerDetails \/>}/);
  assert.match(tabs, /All Customers/);
});

test('customer phone and dedicated WhatsApp links have safe fallbacks', () => {
  const direct = customerContactLinks({ customerPhone: '+91 98765 43210', customerWhatsapp: '90000 00001' });
  assert.equal(direct.callUrl, 'tel:+919876543210');
  assert.equal(direct.whatsappUrl, 'https://wa.me/919000000001');
  const fallback = customerContactLinks({ customerPhone: '9876543210', customerWhatsapp: '' });
  assert.equal(fallback.whatsappUrl, 'https://wa.me/919876543210');
  assert.deepEqual(customerContactLinks({ customerPhone: 'invalid' }), { callUrl: null, whatsappUrl: null });
});

test('every list row and mobile card renders Call and WhatsApp actions', () => {
  assert.equal((list.match(/<CustomerContactActions customer={c}/g) || []).length, 2);
  assert.match(buttons, /href={callUrl}/);
  assert.match(buttons, /href={whatsappUrl}/);
  assert.match(buttons, /event\.stopPropagation\(\)/);
  assert.match(buttons, /rel="noopener noreferrer"/);
  assert.match(css, /customer-directory-contact__button/);
});

test('whole customer card opens profile without hijacking edit, call or WhatsApp', () => {
  assert.match(list, /className="customer-directory-row"/);
  assert.match(list, /className="customer-directory-card"/);
  assert.match(list, /handleCustomerClick\(event, c\)/);
  assert.match(list, /handleCustomerKeyDown\(event, c\)/);
  assert.match(list, /isInteractiveTarget\(event\.target\)/);
  assert.match(list, /event\.stopPropagation\(\); openEditModal\(c\)/);
  assert.match(list, /tabIndex={0}/);
});

test('profile uses customer name, never displays raw UUID as ID text', () => {
  assert.doesNotMatch(list, /\{c\.email \|\| c\.id\}/);
  assert.doesNotMatch(profile, /Customer ID:.*customer\.id/);
  assert.match(profile, /customer-profile-breadcrumb/);
  assert.match(profile, /All Customers/);
  assert.match(profile, /customer-profile-edit/);
  assert.match(profile, /customerContactLinks/);
  assert.match(profile, /Promise\.allSettled/);
  assert.match(profile, /lastVisitDate = customer\.lastVisit \|\| jobs\[0\]\?\.createdDate \|\| '—'/);
});
