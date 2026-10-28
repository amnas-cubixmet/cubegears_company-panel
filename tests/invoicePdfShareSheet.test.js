import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const share = read('src/components/invoices/InvoicePdfShareSheet.jsx');
const css = read('src/styles/invoice-pdf-share-sheet.css');
const modal = read('src/styles/responsive-modal-sheet.css');
const service = read('src/services/billing.service.js');
const invoice = read('src/pages/invoices/InvoiceRoutePage.jsx');
const job = read('src/pages/jobs/JobCardWorkspace.jsx');

test('PDF share menu uses bottom-mounted accessible mobile sheet with controls', () => {
  assert.match(share, /<ResponsiveModalSheet isOpen onClose=\{onClose\} title="Share invoice PDF"/);
  assert.match(share, /Share PDF/);
  assert.match(share, /Download PDF/);
  assert.match(share, /<button type="button" className="invoice-pdf-share-cancel" onClick=\{onClose\}>Cancel/);
  assert.match(modal, /\.responsive-modal-overlay\s*\{[\s\S]*position:fixed/);
  assert.match(modal, /@media\(max-width:767px\)/);
  assert.match(modal, /align-items:flex-end/);
  assert.match(modal, /env\(safe-area-inset-bottom\)/);
  assert.match(css, /invoice-pdf-share-file/);
  assert.match(css, /min-height:54px/);
});

test('Share PDF calls navigator.share synchronously from a real tap and retains fallback', () => {
  assert.match(share, /const share = \(\) => \{/);
  assert.match(share, /const result = navigator\.share\(\{/);
  assert.match(share, /files: \[file\]/);
  assert.match(share, /title: invoiceName/);
  assert.doesNotMatch(share, /await navigator\.share/);
  assert.match(share, /navigator\.canShare\(\{ files: \[file\] \}\)/);
  assert.match(share, /Sharing is not available in this browser|Native sharing is not available in this browser/);
  assert.match(share, /err\?\.name !== 'AbortError'/);
  assert.match(share, /billingService\.savePdfFile\(file\)/);
  assert.match(share, /setRetry\(\(n\) => n \+ 1\)/);
});

test('Native share and download reuse the same authenticated saved PDF', () => {
  assert.match(service, /export const getBillingPdfFile = async/);
  assert.match(service, /apiClient\.get\('\/billing\/documents\/' \+ encodeURIComponent\(documentId\) \+ '\/pdf'/);
  assert.match(service, /responseType: 'blob'/);
  assert.match(service, /Accept: 'application\/pdf, application\/json'/);
  assert.match(service, /new File\(\[pdf\], filename, \{ type: 'application\/pdf' \}\)/);
  assert.match(service, /export const saveBillingPdfFile = \(file\) => \{/);
  assert.match(service, /pdf\.type\.includes\('pdf'\)/);
  assert.match(share, /billingService\.getPdfFile\(invoice\)/);
  assert.match(service, /downloadPdf: downloadBillingPdf/);
  assert.match(service, /getPdfFile: getBillingPdfFile/);
  assert.match(service, /savePdfFile: saveBillingPdfFile/);
});

test('All invoice PDF actions use share sheet while retaining server-saved invoice gating', () => {
  assert.match(invoice, /onPdf=\{\(document\) => downloadPdf\(document\)\}/);
  assert.match(invoice, /setPdfShareInvoice\(documentToDownload\)/);
  assert.match(invoice, /Save the invoice before sharing its PDF/);
  assert.match(invoice, /const shareSheet = pdfShareInvoice\?\.id/);
  assert.match(invoice, /\{shareSheet\}/);
  assert.match(invoice, /disabled=\{loading \|\| pdfLoading \|\| !form\.id\}/);
  assert.match(job, /setInvoiceShareDocument\(linkedInvoice\)/);
  assert.match(job, /invoice=\{invoiceShareDocument\}/);
});
