import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL('../' + path, import.meta.url), 'utf8');

test('invoice branch-state mismatch shows authoritative supplying state and targeted Company Settings', () => {
  const editor = read('src/pages/invoices/InvoiceRoutePage.jsx');
  assert.match(editor, /workshopTaxProfile\?\.registrationStateMismatch/);
  assert.match(editor, /workshopTaxProfile\.supplyingState/);
  assert.match(editor, /workshopTaxProfile\.supplierState/);
  assert.match(editor, /workshopTaxProfile\?\.branchId/);
  assert.match(editor, /encodeURIComponent\(workshopTaxProfile\.branchId\)/);
  assert.match(editor, /\/account\/company\?branchId=/);
  assert.match(editor, /Review branch settings/);
  assert.match(editor, /aria-invalid=\{registrationMismatch\}/);
});

test('company profile exposes authorized branch State editor with explicit confirmation', () => {
  const page = read('src/pages/saas/OwnerCompanyProfile.jsx');
  const editor = read('src/pages/saas/BranchRegistrationEditor.jsx');
  const service = read('src/services/branch.service.js');
  assert.match(page, /<BranchRegistrationEditor companyState=\{values\.state\} gstin=\{values\.gstin\}/);
  assert.match(editor, /branchService\.getBranches\(\)/);
  assert.match(editor, /branchService\.updateBranchState\(selected\.id, selectedName\)/);
  assert.match(editor, /I confirm this is the actual state/);
  assert.match(editor, /!confirmed \|\| !isChanged/);
  assert.match(editor, /new URLSearchParams\(location\.search\)\.get\('branchId'\)/);
  assert.match(editor, /do not change a real branch location just to bypass GST validation/);
  assert.match(service, /apiClient\.patch\('\/branches\/' \+ encodeURIComponent\(branchId\)/);
  assert.match(service, /state: trimmed/);
});

test('branch location correction UI never silently changes company GSTIN or fakes invoice mode', () => {
  const editor = read('src/pages/saas/BranchRegistrationEditor.jsx');
  const service = read('src/services/branch.service.js');
  assert.doesNotMatch(service, /apiClient\.patch\('\/company\/me'/);
  assert.doesNotMatch(editor, /invoiceType: ['"]regular['"]/);
  assert.match(editor, /state still differs from the company GSTIN/);
  const styles = read('src/styles/owner-company-profile.css');
  assert.match(styles, /owner-company-branch-form/);
  assert.match(styles, /@media\(max-width:700px\)/);
});
