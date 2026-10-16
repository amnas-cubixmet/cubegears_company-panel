import test from 'node:test';
import assert from 'node:assert/strict';
import { featureLabelStatus } from '../src/utils/featureActivation.js';

test('zero-priced catalogue placeholders never offer activation even with wallet credits', () => {
  const result = featureLabelStatus({id:null, perUserCredits:'0.00', totalCredits:'0.00', purchaseEnabled:false, purchaseDisabledReason:'MODULE_PRICE_NOT_SET'}, {canManage:true, balance:'1000'});
  assert.equal(result.allow, false);
  assert.equal(result.label, 'Price not set');
  assert.match(result.message, /Price not set/);
});

test('positive published module quotes still allow purchase', () => {
  assert.equal(featureLabelStatus({purchaseEnabled:true, totalCredits:'20.00'}, {canManage:true,balance:'100'}).allow, true);
});
