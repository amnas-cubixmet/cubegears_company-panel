import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (name) => readFileSync(new URL(name, import.meta.url), 'utf8');
const billing = read('../src/services/billing.service.js');
const invoice = read('../src/pages/invoices/InvoiceRoutePage.jsx');
const job = read('../src/pages/jobs/JobCardWorkspace.jsx');

test('PDF download uses authenticated backend PDF and a real blob file', () => {
  assert.match(billing, /export const downloadBillingPdf/);
  assert.match(billing, /\/billing\/documents\/\$\{encodeURIComponent\(documentId\)\}\/pdf/);
  assert.match(billing, /responseType: 'blob'/);
  assert.match(billing, /URL\.createObjectURL\(pdf\)/);
  assert.match(billing, /link\.download = filename/);
  assert.match(billing, /URL\.revokeObjectURL\(url\)/);
  assert.doesNotMatch(billing, /fetch\([^)]*pdf/);
});

test('Invoice list and detail PDF buttons download saved invoices, not print dialog', () => {
  assert.match(invoice, /onPdf=\{\(document\) => downloadPdf\(document\)\}/);
  assert.match(invoice, /onClick=\{\(\) => downloadPdf\(form\)\}/);
  assert.match(invoice, /Download Invoice PDF/);
  assert.match(invoice, /disabled=\{loading \|\| pdfLoading \|\| !form\.id\}/);
  assert.match(invoice, /Save Draft first to download PDF/);
});

test('Job Invoice has its own real Download Invoice PDF action', () => {
  assert.match(job, /const downloadJobInvoicePdf = async/);
  assert.match(job, /billingService\.downloadPdf\(linkedInvoice\)/);
  assert.match(job, /linkedInvoice\?\.id && \(/);
  assert.match(job, /invoicePdfLoading \? 'Generating PDF…' : 'Download Invoice PDF'/);
});

test('PDF action displays API errors without silently printing unsaved form changes', () => {
  assert.match(invoice, /setError\(e\?\.message \|\| 'Unable to download invoice PDF\.'\)/);
  assert.match(job, /setInvoicePdfError\(err\?\.message \|\| 'Unable to download invoice PDF\.'\)/);
  assert.match(billing, /Save the invoice before downloading its PDF/);
  assert.match(billing, /Official invoice PDF download requires the connected Django backend/);
});
