import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { validateEWayForPreparation, parseEWayApiErrors } from '../src/utils/eWayFormValidation.js';

const read = (path) => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const valid = () => ({
  id:'', invoiceId:'', supplyType:'Outward',subSupplyType:'Supply',
  documentNo:'INV-2026-0001', documentDate:'2026-10-28',
  from:{gstin:'32ABCDE1234F1Z5',tradeName:'Garage',address:'Workshop Rd',
    place:'Thrissur',pincode:'680001',stateCode:'32'},
  to:{gstin:'URP',tradeName:'Customer',address:'Shop Road',
    place:'Kochi',pincode:'682001',stateCode:'32'},
  items:[{id:'item-1',productName:'Spare part',hsnCode:'8708',
    qty:1,unit:'PCS',taxableValue:100,cgstRate:9,sgstRate:9,
    igstRate:'',cessRate:''}],
  transport:{mode:'Road',distanceKm:'10',vehicleNo:'KL08AB1234',transporterId:''}
});
test('E-Way Bill highlights invalid document and goods fields before API submission', () => {
  const d=valid();d.documentNo='';d.documentDate='';d.to.gstin='ABC';
  d.to.address='';d.to.stateCode='';d.items[0].hsnCode='';
  d.items[0].qty='';d.transport.distanceKm='';d.transport.vehicleNo='';
  const errors=validateEWayForPreparation(d);
  for(const k of ['documentNo','documentDate','to.gstin','to.address',
    'to.stateCode','items.0.hsnCode','items.0.qty',
    'transport.distanceKm','transport.vehicleNo']){
    assert.ok(errors[k], 'Expected inline error: '+k);
  }
});
test('valid E-Way Bill can reach backend prepare action', () => {
  assert.deepEqual(validateEWayForPreparation(valid()), {});
});
test('a Django party error links to the corresponding input', () => {
  const e=parseEWayApiErrors({
    data:{to:['Enter valid GSTIN or URP for unregistered party.']},
    message:'Could not prepare draft.'
  });
  assert.match(e.fieldErrors['to.gstin'],/GSTIN/);
  const from=parseEWayApiErrors({data:{from:['Enter a valid six-digit PIN code.']}});
  assert.ok(from.fieldErrors['from.pincode']);
  const goods=parseEWayApiErrors({data:{items:['Enter valid goods HSN for item 1.']}});
  assert.ok(goods.fieldErrors['items.0.hsnCode']);
});
test('Django transport and goods errors focus the exact editable input', () => {
  const distance = parseEWayApiErrors({ data: {
    transport: ['Enter approximate distance in whole kilometres.'],
  } });
  assert.ok(distance.fieldErrors['transport.distanceKm']);
  const doc = parseEWayApiErrors({ data: {
    transport: ['Transport document number is required.'],
  } });
  assert.ok(doc.fieldErrors['transport.transportDocNo']);
  const name = parseEWayApiErrors({ data: {
    items: ['Enter goods name for item 2.'],
  } });
  assert.ok(name.fieldErrors['items.1.productName']);
});

test('New E-Way Bill does not submit empty linked invoice UUID', () => {
  const service=read('src/services/eWayBill.service.js');
  assert.match(service,/export const prepareEWayBillForApi = \(draft\) =>/);
  assert.match(service,/const \{ invoiceId, \.\.\.payload \} = draft \|\| \{\}/);
  assert.match(service,/if \(invoiceId\) payload\.invoiceId = invoiceId/);
  assert.match(service,/apiClient\.post\('\/e-way-bills', payload\)/);
});
test('E-Way Bill shows field errors, scrolls into view, and removes GST explanation', () => {
  const page=read('src/pages/invoices/EWayBillPage.jsx');
  const styles=read('src/styles/e-way-input-validation.css');
  assert.match(page,/validateEWayForPreparation\(form\)/);
  assert.match(page,/setFieldErrors\(invalidFields\)/);
  assert.match(page,/parseEWayApiErrors\(e\)/);
  assert.match(page,/scrollIntoView\(\{ behavior: 'smooth', block: 'center' \}\)/);
  assert.match(page,/focus\(\{ preventScroll: true \}\)/);
  assert.match(page,/data-eway-field="documentNo"/);
  assert.match(page,/data-eway-field="to\.gstin"/);
  assert.match(page,/data-eway-field=\{\`items\.\$\{index\}\.hsnCode\`\}/);
  assert.match(page,/aria-invalid=\{Boolean\(fieldErrors/);
  assert.match(page,/className="eway-input-error"/);
  assert.match(styles, /\[data-eway-field\]\[aria-invalid="true"\]/);
  assert.doesNotMatch(page, /Intra-state: GST is split equally/);
  assert.doesNotMatch(page, /Inter-state: IGST applies/);
  assert.doesNotMatch(page, /CGST: \{item\.cgstRate/);
  assert.doesNotMatch(page, /eway-gst-breakdown/);
});
