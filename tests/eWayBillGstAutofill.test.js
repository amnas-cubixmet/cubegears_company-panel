import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { eWayTaxMode, eWaySetGstRate, eWayReconcileGst, eWayTotalGstRate } from '../src/utils/eWayGst.js';
import { calculateEWayTotals } from '../src/utils/eWayBillTotals.js';

const read = (p) => readFileSync(new URL('../' + p, import.meta.url), 'utf8');
const line = { id: 'one', productName: 'Car part', qty: 1, hsnCode: '8708', taxableValue: 100,
  cgstRate: '', sgstRate: '', igstRate: '', cessRate: '' };

test('E-Way Bill 100 plus 18% CGST/SGST or IGST always totals 118', () => {
  const intra = { from: {stateCode:'32'},to:{stateCode:'32'},items:[eWaySetGstRate(line,'18','cgst_sgst')] };
  assert.equal(eWayTaxMode(intra),'cgst_sgst');
  assert.equal(intra.items[0].cgstRate,9);
  assert.equal(intra.items[0].sgstRate,9);
  assert.equal(intra.items[0].igstRate,'');
  assert.equal(calculateEWayTotals(intra).cgst,9);
  assert.equal(calculateEWayTotals(intra).sgst,9);
  assert.equal(calculateEWayTotals(intra).totalValue,118);
  const inter = {...intra,to:{stateCode:'33'},items:eWayReconcileGst(intra.items,'igst')};
  assert.equal(eWayTaxMode(inter),'igst');
  assert.equal(inter.items[0].cgstRate,'');
  assert.equal(inter.items[0].sgstRate,'');
  assert.equal(inter.items[0].igstRate,18);
  assert.equal(eWayTotalGstRate(inter.items[0]),18);
  assert.equal(calculateEWayTotals(inter).totalValue,118);
});

test('GST conversion preserves CESS and adds non-advalorem/other amounts exactly once', () => {
  const doc={from:{stateCode:'32'},to:{stateCode:'33'},
    items:[{...eWaySetGstRate(line,'18','igst'),cessRate:'1'}],
    cessNonAdvolAmount:'2',otherAmount:'3'};
  const totals=calculateEWayTotals(doc);
  assert.equal(totals.taxableValue,100);
  assert.equal(totals.igst,18);
  assert.equal(totals.cess,1);
  assert.equal(totals.totalValue,124);
});

test('New E-Way Bill never invents Kerala FROM/TO state values', () => {
  const source=read('src/services/eWayBill.service.js');
  assert.match(source, /from: \{[\s\S]*?stateCode: ''[\s\S]*?to: \{[\s\S]*?stateCode: ''/);
});

test('Invoice-to-E-Way-Bill carries legal destination state and item tax rates', () => {
  const page=read('src/pages/invoices/EWayBillPage.jsx');
  assert.match(page, /invoiceStateCode\(invoice\.customer\?\.placeOfSupply \|\| invoice\.customer\?\.stateCode \|\| invoice\.customer\?\.state\)/);
  assert.match(page, /item\.hsnCode \|\| ''/);
  assert.match(page, /item\.unit \|\| 'PCS'/);
  assert.match(page, /Number\(item\.taxRate \|\| 0\), invoice\.taxMode/);
  assert.match(page, /items: eWayReconcileGst\(next\.items, eWayTaxMode\(next\)\)/);
});

test('Outward supplier fields are API-backed, read-only and server enforced', () => {
  const service=read('src/services/eWayBill.service.js');
  const page=read('src/pages/invoices/EWayBillPage.jsx');
  assert.match(service,/apiClient\.get\('\/e-way-bills\/from-context'\)/);
  assert.match(page,/eWayBillService\.getFromContext\(\)/);
  assert.match(page,/readOnly=\{isOutward\}/);
  assert.match(page,/Auto-filled from Company \/ Branch Settings/);
  assert.match(page,/group === 'from' && old\.supplyType === 'Outward'/);
  assert.match(page,/eWayReconcileGst\(next\.items, eWayTaxMode\(next\)\)/);
});

test('Goods tax control allows only one state-appropriate GST rate, plus independent CESS', () => {
  const page=read('src/pages/invoices/EWayBillPage.jsx');
  assert.match(page,/aria-label="GST rate"/);
  assert.match(page,/updateItemGst\(item\.id, e\.target\.value\)/);
  assert.doesNotMatch(page,/Inter-state: IGST applies/);
  assert.doesNotMatch(page,/Intra-state: GST is split equally/);
  assert.match(page,/value=\{item\.cessRate\}/);
  assert.match(page,/CESS Non-Advol/);
  assert.match(page,/Other Amount/);
  assert.match(page,/Transporter ID \/ GSTIN/);
  assert.match(page,/Vehicle Number/);
  assert.match(page,/Remarks \/ Notes/);
});
