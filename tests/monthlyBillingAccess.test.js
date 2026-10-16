import test from 'node:test';
import assert from 'node:assert/strict';
import { setupRedirect, isAccountOnly } from '../src/utils/accountWorkspace.js';
const access = {enforced:true, paidAccessRequired:true, unavailable:false, modules:['customers'], freeModules:['dashboard','staff'], permissions:['dashboard.view','staff.view','billing.view'], isCompanyOwner:true, billingStatus:{enabled:true,blocked:true}};

test('overdue debt locks even the free dashboard and active paid modules', () => {
  assert.equal(isAccountOnly(access), true);
  for(const path of ['/dashboard','/customers','/staff-management']) assert.equal(setupRedirect(access,path), '/account');
});
test('owner can read storage audit and reach top-ups while payment is overdue', () => {
  for(const path of ['/account','/account/credits/buy','/account/credits/logs','/account/storage','/account/storage/history','/account/storage/history/2026-10-01']) assert.equal(setupRedirect(access,path),null,path);
  assert.equal(setupRedirect({...access,isCompanyOwner:false},'/account/storage'),'/access-denied');
});
test('a zero balance before the due date does not lock an authorized workspace', () => {
  assert.equal(isAccountOnly({...access,billingStatus:{enabled:true,blocked:false}}),false);
});

import { featureLabelStatus } from '../src/utils/featureActivation.js';
test('positive postpaid quote can activate with zero balance, prepaid cannot', () => {
  const quote = {purchaseEnabled:true,totalCredits:'30.00',billingMode:'monthly_postpaid'};
  assert.equal(featureLabelStatus(quote,{canManage:true,balance:'0.00'}).allow,true);
  assert.equal(featureLabelStatus({...quote,billingMode:'prepaid'},{canManage:true,balance:'0.00'}).allow,false);
  assert.equal(featureLabelStatus({...quote,totalCredits:'0.00'},{canManage:true,balance:'0.00'}).allow,false);
});

test('storage debt also locks legacy companies without paid-feature enforcement', () => {
  const legacy = {...access,enforced:false,paidAccessRequired:false,labelOnly:false};
  assert.equal(isAccountOnly(legacy),true);
  assert.equal(setupRedirect(legacy,'/dashboard'),'/account');
});
