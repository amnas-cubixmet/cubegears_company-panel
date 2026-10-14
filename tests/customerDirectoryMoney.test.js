import test from 'node:test';
import assert from 'node:assert/strict';
import {
  customerInvoiceMoney, invoiceMoney, formatCustomerMoney, customerStatusLabel,
} from '../src/pages/customers/customerDirectoryMoney.js';

test('Django invoice fields paid, balance and total calculate accurate customer money', () => {
  const money = customerInvoiceMoney([
    { kind: 'invoice', status: 'Finalized', total: '12500.00', paid: '3000.00', balance: '9500.00' },
    { kind: 'invoice', status: 'Paid', total: '2100.50', paid: '2100.50', balance: '0.00' },
  ]);
  assert.deepEqual(money, { totalSpent: 5100.5, outstanding: 9500, moneyAvailable: true });
  assert.equal(formatCustomerMoney(money.outstanding), '₹9,500.00');
});

test('Legacy invoice field names stay supported, not just Django names', () => {
  assert.deepEqual(customerInvoiceMoney([
    { status: 'Finalized', totalAmount: 1000, paidAmount: 200, balanceDue: 800 },
  ]), { totalSpent: 200, outstanding: 800, moneyAvailable: true });
});

test('Draft invoices, cancelled invoices and estimates are not outstanding debt', () => {
  const result = customerInvoiceMoney([
    { kind: 'estimate', status: 'Approved', total: 5000, paid: 0, balance: 5000 },
    { kind: 'invoice', status: 'Draft', total: 7000, paid: 0, balance: 7000 },
    { kind: 'invoice', status: 'Cancelled', total: 8000, paid: 0, balance: 8000 },
    { kind: 'invoice', status: 'Finalized', total: 100, paid: 20, balance: 80 },
  ]);
  assert.equal(result.outstanding, 80);
  assert.equal(result.totalSpent, 20);
});

test('Never invent ₹0 for missing invoice fields or failed invoice calls', () => {
  assert.deepEqual(customerInvoiceMoney([{ status: 'Finalized', number: 'INV-1' }]), {
    totalSpent: null, outstanding: null, moneyAvailable: false,
  });
  assert.equal(formatCustomerMoney(null), '—');
  assert.equal(formatCustomerMoney(undefined), '—');
  assert.deepEqual(customerInvoiceMoney([]), { totalSpent: 0, outstanding: 0, moneyAvailable: true });
  assert.throws(() => customerInvoiceMoney(undefined), /not returned as a list/);
});

test('Paid and outstanding are derived without double-counting invoice payments', () => {
  assert.deepEqual(invoiceMoney({ total: '850.00', paid: '200.00' }), { paid: 200, balance: 650 });
  assert.deepEqual(invoiceMoney({ total: '900.00', balance: '400.00' }), { paid: 500, balance: 400 });
  assert.equal(customerStatusLabel('active'), 'Active');
  assert.equal(customerStatusLabel('ARCHIVED'), 'Archived');
});
