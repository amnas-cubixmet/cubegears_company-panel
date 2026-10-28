import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  eWayGstinStateCode, eWayRecipientWithGstin,
  eWayTaxMode, eWayTotalGstRate, eWaySetGstRate, eWayReconcileGst,
} from '../src/utils/eWayGst.js';
import { calculateEWayTotals } from '../src/utils/eWayBillTotals.js';

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const line = {
  id: 'good1', productName: 'Car component', hsnCode: '8708',
  qty: 1, taxableValue: 100, cgstRate: '', sgstRate: '', igstRate: '', cessRate: '',
};

test('TO State Code is auto-filled using the customer GSTIN prefix', () => {
  assert.equal(eWayGstinStateCode('32ABCDE1234F1Z5'), '32');
  assert.equal(eWayGstinStateCode('33abcde1234f1z5'), '33');
  assert.equal(eWayGstinStateCode('32'), '32');
  assert.equal(eWayGstinStateCode('URP'), '');
  assert.equal(eWayGstinStateCode(''), '');
  assert.equal(eWayGstinStateCode('99ABC'), '');
  assert.equal(eWayGstinStateCode('BLANK'), '');
  const to = eWayRecipientWithGstin({gstin: '',stateCode:''}, '33abcde1234f1z5');
  assert.equal(to.stateCode, '33');
  assert.equal(to.gstin, '33ABCDE1234F1Z5');
});

test('unregistered recipients keep a manually selected TO state, without guessing', () => {
  const urp = eWayRecipientWithGstin({ gstin: 'URP', stateCode:'32'}, 'URP');
  assert.equal(urp.stateCode, '32');
  const changed = eWayRecipientWithGstin({ gstin:'33ABCDE1234F1Z5',stateCode:'33'},'URP');
  assert.equal(changed.stateCode, '');
  assert.equal(changed.gstin, 'URP');
});

test('GST rate dropdown may select 18% before FROM/TO state codes are available', () => {
  const pending = eWaySetGstRate(line,'18','unknown');
  assert.equal(eWayTotalGstRate(pending), 18);
  assert.equal(pending.gstRate, 18);
  assert.equal(pending.cgstRate, '');
  assert.equal(pending.sgstRate, '');
  assert.equal(pending.igstRate, '');
  const noState = {from:{stateCode:''},to:{stateCode:''},items:[pending]};
  assert.equal(eWayTaxMode(noState),'unknown');
  assert.equal(calculateEWayTotals(noState).taxableValue, 100);
  assert.equal(calculateEWayTotals(noState).totalValue,100);
});

test('after TO state autofill, selected GST moves to IGST or CGST/SGST', () => {
  const pending = eWaySetGstRate(line,'18','unknown');
  const inter = {from:{stateCode:'32'},to:{stateCode:'33'}};
  assert.equal(eWayTaxMode(inter),'igst');
  const i = eWayReconcileGst([pending],eWayTaxMode(inter))[0];
  assert.equal(i.igstRate,18);
  assert.equal(i.cgstRate,'');
  assert.equal(calculateEWayTotals({...inter,items:[i]}).totalValue,118);
  const intra = {from:{stateCode:'32'},to:{stateCode:'32'}};
  const c = eWayReconcileGst([i],eWayTaxMode(intra))[0];
  assert.equal(c.cgstRate,9);
  assert.equal(c.sgstRate,9);
  assert.equal(c.igstRate,'');
  assert.equal(calculateEWayTotals({...intra,items:[c]}).totalValue,118);
});

test('clearing destination state retains selected GST but removes stale tax amounts', () => {
  const igst = eWaySetGstRate(line,18,'igst');
  const pending = eWayReconcileGst([igst],'unknown')[0];
  assert.equal(pending.gstRate,18);
  assert.equal(pending.igstRate,'');
  assert.equal(pending.cgstRate,'');
  assert.equal(pending.sgstRate,'');
});

test('GST Rate select stays enabled and TO State Code has an Indian-state dropdown', () => {
  const page = read('src/pages/invoices/EWayBillPage.jsx');
  assert.match(page, /<select aria-label="GST rate" value=\{String\(eWayTotalGstRate\(item\)\)\}/);
  assert.doesNotMatch(page, /disabled=\{gstMode === 'unknown'\}/);
  assert.match(page, /updateItemGst\(item.id, e.target.value\)/);
  assert.match(page, /<select aria-label="TO State Code"/);
  assert.match(page, /disabled=\{Boolean\(eWayGstinStateCode\(form.to\?\.gstin\)\)\}/);
  assert.match(page, /eWayRecipientWithGstin\(old.to, value\)/);
  assert.match(page, /Auto-filled from customer GSTIN/);
  assert.match(page, /Select state for URP/);
  assert.match(page, /INDIA_STATES.map/);
  assert.doesNotMatch(page, /GST .*selected · Tax split pending State Code/);
});

test('HSN / Item Code is an alphanumeric text field with a full keyboard', () => {
  const page=read('src/pages/invoices/EWayBillPage.jsx');
  assert.match(page, /HSN \/ Item Code/);
  assert.match(page, /type="text"\s+inputMode="text"\s+maxLength=\{16\}/);
  assert.match(page, /e.target.value.replace\(\/\[\^A-Za-z0-9\]\/g, ''\).toUpperCase\(\).slice\(0, 16\)/);
  assert.match(page, /placeholder="8708 or AB12"/);
  assert.match(page, /Official HSN for API preparation must be 2–8 digits/);
});
