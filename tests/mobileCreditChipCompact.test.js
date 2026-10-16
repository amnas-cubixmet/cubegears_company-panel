import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { formatWalletBalance } from '../src/utils/formatWalletBalance.js';

const read = (file) => readFileSync(new URL('../' + file, import.meta.url), 'utf8');

test('mobile credit chip uses K above four digits', () => {
  assert.equal(formatWalletBalance('9999', { compact: true }), '9,999');
  assert.equal(formatWalletBalance('10000', { compact: true }), '10K');
  assert.equal(formatWalletBalance('12000', { compact: true }), '12K');
  assert.equal(formatWalletBalance('516540.00', { compact: true }), '516.5K');
  assert.equal(formatWalletBalance('1234567', { compact: true }), '1,234.6K');
});

test('full wallet balance is unchanged for desktop and accessible name', () => {
  assert.equal(formatWalletBalance('516540.00'), '5,16,540');
  assert.equal(formatWalletBalance('12345.67'), '12,345.67');
  assert.equal(formatWalletBalance(null, { compact: true }), '—');
  assert.equal(formatWalletBalance('not-a-balance', { compact: true }), '—');
});

test('shortened amount appears visually only on mobile, exact amount stays accessible', () => {
  const chip = read('src/components/layout/CreditBalanceChip.jsx');
  const css = read('src/styles/credit-wallet.css');
  const header = read('src/components/layout/Header.jsx');

  assert.match(chip, /formatWalletBalance\(wallet\?\.balance, \{ compact: true \}\)/);
  assert.match(chip, /cg-credit-chip-full/);
  assert.match(chip, /cg-credit-chip-mobile/);
  assert.match(chip, /Credit balance: \$\{fullBalance\} credits/);
  assert.match(chip, /Your verified credit balance: \$\{fullBalance\} credits/);
  assert.match(css, /\.cg-credit-chip-mobile\{display:none\}/);
  assert.match(css, /@media\(max-width:767px\)/);
  assert.match(css, /\.mobile-header-actions \.cg-credit-chip-full\{display:none\}/);
  assert.match(css, /\.mobile-header-actions \.cg-credit-chip-mobile\{display:inline\}/);
  assert.match(header, /<CreditBalanceChip compact\s*\/>/);
});
