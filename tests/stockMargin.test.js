import test from 'node:test';
import assert from 'node:assert/strict';
import { formatStockMarginPercent, stockMarginPercentage } from '../src/utils/stockMargin.js';

test('missing marginPercent derives from stock prices instead of crashing', () => {
  assert.equal(formatStockMarginPercent({ costPrice: 700, sellingPrice: 1000 }), '30.0%');
});

test('backend string margin percentage is accepted, including zero', () => {
  assert.equal(formatStockMarginPercent({ marginPercent: '12.56' }), '12.6%');
  assert.equal(formatStockMarginPercent({ marginPercent: 0, costPrice: 200, sellingPrice: 500 }), '0.0%');
});

test('empty, missing and zero-priced stock items show unavailable percentage', () => {
  assert.equal(formatStockMarginPercent({}), '—');
  assert.equal(formatStockMarginPercent(undefined), '—');
  assert.equal(formatStockMarginPercent({ costPrice: 0, sellingPrice: 0 }), '—');
  assert.equal(formatStockMarginPercent({ costPrice: null, sellingPrice: 150 }), '—');
});

test('non-finite percentages and prices do not leak NaN or Infinity into UI', () => {
  assert.equal(formatStockMarginPercent({ marginPercent: 'NaN', costPrice: 50, sellingPrice: 100 }), '50.0%');
  assert.equal(formatStockMarginPercent({ marginPercent: Infinity, costPrice: 90, sellingPrice: 100 }), '10.0%');
  assert.equal(stockMarginPercentage({ sellingPrice: 'x', costPrice: 30 }), null);
});

test('snake_case inventory records are supported', () => {
  assert.equal(formatStockMarginPercent({ selling_price: '3500', cost_price: '2000' }), '42.9%');
  assert.equal(formatStockMarginPercent({ margin_percent: '18.5' }), '18.5%');
});
