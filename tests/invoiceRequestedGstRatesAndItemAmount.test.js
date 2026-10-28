import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  INVOICE_CGST_SGST_RATES,
  INVOICE_IGST_RATES,
  invoiceLineTaxChoices,
  invoiceTotalFromGstComponent,
  invoiceComponentFromTotalRate,
} from '../src/utils/invoiceTaxUi.js';
import { normalizeHsnSacCode, validateInvoiceDraft, prepareInvoicePayloadForApi } from '../src/utils/invoicePayload.js';
import { calculateEstimateIndiaGst } from '../src/utils/indiaGst.js';

const read = (path) => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const editor = read('src/pages/invoices/InvoiceRoutePage.jsx');

test('Goods / Services offers only requested intra-state CGST and SGST pairs and GST None', () => {
  assert.deepEqual(INVOICE_CGST_SGST_RATES, ['2.5', '5', '9', '18']);
  const choices = invoiceLineTaxChoices('cgst_sgst');
  assert.deepEqual(choices.map(x => x.value), ['0', '5', '10', '18', '36']);
  assert.deepEqual(choices.map(x => x.label), [
    'GST None (0%)',
    'CGST 2.5% + SGST 2.5% = 5%',
    'CGST 5% + SGST 5% = 10%',
    'CGST 9% + SGST 9% = 18%',
    'CGST 18% + SGST 18% = 36%',
  ]);
  for (const x of INVOICE_CGST_SGST_RATES) {
    assert.equal(invoiceComponentFromTotalRate(invoiceTotalFromGstComponent(x)), x);
  }
});

test('Goods / Services supports 18 percent interstate IGST and GST None', () => {
  assert.deepEqual(INVOICE_IGST_RATES, ['2.5', '9', '18']);
  assert.deepEqual(invoiceLineTaxChoices('igst'), [
    { value: '0', label: 'GST None (0%)' },
    { value: '2.5', label: 'IGST 2.5%' },
    { value: '9', label: 'IGST 9%' },
    { value: '18', label: 'IGST 18%' },
  ]);
});

test('product ₹100 + 18 percent GST yields ₹118 incl GST for 1 quantity, ₹236 for 2', () => {
  for (const quantity of [1, 2]) {
    const total = calculateEstimateIndiaGst({
      lines: [{ type: 'Service', quantity, unitPrice: 100, taxRate: 18 }],
      registered: true, supplierState: '32', placeOfSupply: '32',
    });
    assert.equal(total.taxable, quantity * 100);
    assert.equal(total.cgst, quantity * 9);
    assert.equal(total.sgst, quantity * 9);
    assert.equal(total.tax, quantity * 18);
    assert.equal(total.total, quantity * 118);
    assert.equal(total.taxRows[0].taxable + total.taxRows[0].cgst + total.taxRows[0].sgst, quantity * 118);
  }
});

test('interstate ₹100 with 18 percent IGST is ₹118, not ₹109 or ₹100', () => {
  assert.ok(invoiceLineTaxChoices('igst').some((rate) => rate.value === '18'));
  const result = calculateEstimateIndiaGst({
    lines: [{ type: 'Service', quantity: 1, unitPrice: 100, taxRate: 18 }],
    registered: true, supplierState: '32', placeOfSupply: '33',
  });
  assert.equal(result.mode, 'igst');
  assert.equal(result.cgst, 0);
  assert.equal(result.sgst, 0);
  assert.equal(result.igst, 18);
  assert.equal(result.taxRows[0].taxable, 100);
  assert.equal(result.total, 118);
});

test('the same ₹100 example has no tax for non-GST and GST None', () => {
  for (const registered of [true, false]) {
    const total = calculateEstimateIndiaGst({
      lines: [{ type: 'Service', quantity: 1, unitPrice: 100, taxRate: 0 }],
      registered, supplierState: '32', placeOfSupply: '32',
    });
    assert.equal(total.tax, 0);
    assert.equal(total.total, 100);
  }
});

test('invoice Goods / Services item and summary display GST inclusive totals', () => {
  const service = read('src/services/billing.service.js');
  assert.match(service, /taxable: Math\.max\(0, Number\(item\.qty \|\| 0\) \* Number\(item\.rate \|\| 0\)/);
  assert.match(service, /lineTotals = gst\.taxRows\.map/);
  assert.match(service, /total: Number\(\(row\.taxable \+ row\.cgst \+ row\.sgst \+ row\.igst\)\.toFixed\(2\)\)/);
  assert.match(editor, /Amount \(Incl\. GST\)/);
  assert.match(editor, /Total \(incl\. GST\)/);
  assert.match(editor, /totals\.lineTotals\[index\]\?\.total \?\? lineAmount/);
  assert.match(editor, /Grand Total \(incl\. GST\)/);
});

test('HSN/SAC accepts numbers plus letters and still preserves leading zeroes', () => {
  assert.equal(normalizeHsnSacCode('0012abc34'), '0012ABC34');
  assert.equal(normalizeHsnSacCode('ab-0012 z9'), 'AB0012Z9');
  assert.equal(normalizeHsnSacCode('A'.repeat(50)).length, 30);
  const data = {
    date: '2026-10-27', invoiceType: 'gst',
    seller: { gstin: '32ABCDE1234F1Z5', state: 'Kerala' },
    customer: { name: 'Demo', placeOfSupply: '32-Kerala' },
    items: [{ id: '1', type: 'Service', unit: 'PCS', description: 'Repair', hsnCode: 'A120B9',
      qty: '1', rate: '100', taxRate: '18' }],
    paid: '', discount: '', adjustment: '',
  };
  assert.equal(validateInvoiceDraft(data)['items.0.hsnCode'], undefined);
  assert.equal(prepareInvoicePayloadForApi(data).items[0].hsnCode, 'A120B9');
  assert.match(editor, /<span className="invoice-mobile-label">Type<\/span>/);
  assert.match(editor, /<span>Item Name<\/span>/);
  assert.match(editor, /inputMode="text" maxLength=\{30\}/);
});
