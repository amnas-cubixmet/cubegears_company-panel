import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const page = read('src/pages/invoices/EWayBillPage.jsx');
const sheet = read('src/components/invoices/EWayBillPdfShareSheet.jsx');
const service = read('src/services/eWayBill.service.js');
const validation = read('src/utils/eWayFormValidation.js');

test('saved E-Way Bill opens the same iPhone-style sheet, not window.print', () => {
  assert.match(page, /import \{ EWayBillPdfShareSheet \}/);
  assert.match(page, /setPdfShareOpen\(true\)/);
  assert.match(page, /const pdfShareSheet = pdfShareOpen && form\?\.id/);
  assert.match(page, /<EWayBillPdfShareSheet document=\{form\}/);
  assert.match(page, /onClick=\{openPdfShare\}><Download size=\{16\}\/>Download PDF/);
  assert.doesNotMatch(page, /onClick=\{\(\) => window\.print\(\)\}><Download size=\{16\}\/>Download PDF/);
  assert.match(page, /\{pdfShareSheet\}/);
});

test('E-Way Bill Share Sheet is accessible, native-share compatible and has fallback download', () => {
  assert.match(sheet, /<ResponsiveModalSheet isOpen onClose=\{onClose\} title="Share E-Way Bill PDF"/);
  assert.match(sheet, /const result = navigator\.share\(\{/);
  assert.match(sheet, /navigator\.canShare\(\{ files: \[file\] \}\)/);
  assert.match(sheet, /eWayBillService\.getPdfFile\(document\)/);
  assert.match(sheet, /eWayBillService\.savePdfFile\(file\)/);
  assert.match(sheet, /Share PDF/);
  assert.match(sheet, /Download PDF/);
  assert.match(sheet, /Cancel/);
  assert.match(sheet, /Local document only/);
  assert.match(sheet, /err\?\.name !== 'AbortError'/);
});

test('service fetches real saved E-Way Bill PDF using authenticated blob request', () => {
  assert.match(service, /\/e-way-bills\/' \+ encodeURIComponent\(docId\) \+ '\/pdf'/);
  assert.match(service, /responseType: 'blob'/);
  assert.match(service, /Accept: 'application\/pdf, application\/json'/);
  assert.match(service, /if \(!docId\) throw new Error\('Save the E-Way Bill/);
  assert.match(service, /new File\(\[pdf\], 'EWayBill-' \+ safeName \+ '\.pdf'/);
  assert.match(service, /getPdfFile: getEWayBillPdfFile/);
  assert.match(service, /savePdfFile: saveEWayBillPdfFile/);
});

test('HSN letters are allowed in drafts, but official preparation still checks numeric HSN', () => {
  assert.match(page, /HSN \/ Item Code/);
  assert.match(page, /inputMode="text"/);
  assert.match(page, /maxLength=\{16\}/);
  assert.match(page, /replace\(\/\[\^A-Za-z0-9\]\/g, ''\).toUpperCase\(\)/);
  assert.match(validation, /Official HSN must contain 2–8 digits/);
});
