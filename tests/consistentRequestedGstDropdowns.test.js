import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  GST_CGST_SGST_COMPONENT_RATES, GST_IGST_RATES,
  GST_INTRA_TOTAL_RATES, GST_UNKNOWN_TOTAL_RATES,
  gstRateChoices, gstPresetLabel,
} from '../src/utils/gstRatePresets.js';
import { invoiceLineTaxChoices } from '../src/utils/invoiceTaxUi.js';
import { eWayGstChoices, eWaySetGstRate } from '../src/utils/eWayGst.js';
import { estimateGstChoices, estimateGstLabel } from '../src/components/jobs/estimateGstRates.js';
import { calculateEstimateIndiaGst } from '../src/utils/indiaGst.js';

const read = path => readFileSync(new URL('../'+path,import.meta.url),'utf8');

test('only requested CGST/SGST four rates per component with IGST 5 deduplicated', () => {
  assert.deepEqual(GST_CGST_SGST_COMPONENT_RATES, ['2.5','5','9','18']);
  assert.deepEqual(GST_IGST_RATES, ['5']);
  assert.deepEqual(GST_INTRA_TOTAL_RATES, ['5','10','18','36']);
  assert.deepEqual(GST_UNKNOWN_TOTAL_RATES, ['5','10','18','36']);
  assert.deepEqual(gstRateChoices('cgst_sgst').map(x=>x.label), [
    'CGST 2.5% + SGST 2.5% = 5%',
    'CGST 5% + SGST 5% = 10%',
    'CGST 9% + SGST 9% = 18%',
    'CGST 18% + SGST 18% = 36%',
  ]);
  assert.deepEqual(gstRateChoices('igst'), [{value:'5',label:'IGST 5%'}]);
  assert.equal(gstPresetLabel('igst','5'), 'IGST 5%');
});

test('same selectable rates across invoices, estimates, e-way goods and Job Quick Estimate', () => {
  for(const mode of ['cgst_sgst','igst','unknown']) {
    const expected=gstRateChoices(mode).map(x=>x.value);
    assert.deepEqual(invoiceLineTaxChoices(mode).map(x=>x.value),expected);
    assert.deepEqual(eWayGstChoices(mode,'').map(x=>x.value),expected);
    assert.deepEqual(estimateGstChoices('',mode),expected);
  }
  const invoice=read('src/pages/invoices/InvoiceRoutePage.jsx');
  const eway=read('src/pages/invoices/EWayBillPage.jsx');
  const estimate=read('src/components/jobs/QuickEstimatePanel.jsx');
  assert.match(invoice,/invoiceLineTaxChoices\(appliedTaxMode\)/);
  assert.match(eway,/eWayGstChoices\(gstMode, eWayTotalGstRate\(item\)\)/);
  assert.match(estimate,/estimateGstChoices\(line\.taxRate, selectedGstMode\)/);
  assert.match(estimate,/estimateGstLabel\(rate, selectedGstMode\)/);
});

test('previously saved or stock-classified tax is not lost when options change', () => {
  assert.deepEqual(gstRateChoices('igst','18').map(x=>x.value),['5','18']);
  assert.deepEqual(estimateGstChoices('9','igst'),['5','9']);
  assert.deepEqual(invoiceLineTaxChoices('cgst_sgst','0').map(x=>x.value),['5','10','18','36','0']);
  assert.match(estimateGstLabel('18','igst'), /Saved/);
  assert.equal(gstRateChoices('igst','invalid').length,1);
});

test('CGST/SGST total and IGST are mutually exclusive for tax-exclusive ₹100', () => {
  const line=[{type:'Service',quantity:1,unitPrice:100,taxRate:5}];
  const intra=calculateEstimateIndiaGst({lines:line,registered:true,supplierState:'32',placeOfSupply:'32'});
  assert.equal(intra.cgst,2.5);
  assert.equal(intra.sgst,2.5);
  assert.equal(intra.igst,0);
  assert.equal(intra.total,105);
  const inter=calculateEstimateIndiaGst({lines:line,registered:true,supplierState:'32',placeOfSupply:'33'});
  assert.equal(inter.cgst,0);
  assert.equal(inter.sgst,0);
  assert.equal(inter.igst,5);
  assert.equal(inter.total,105);
  const eway=eWaySetGstRate({gstRate:'',cgstRate:'',sgstRate:'',igstRate:''},5,'cgst_sgst');
  assert.equal(eway.cgstRate,2.5);
  assert.equal(eway.sgstRate,2.5);
  assert.equal(eway.igstRate,'');
});
