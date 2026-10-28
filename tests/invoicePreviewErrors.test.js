import test from 'node:test';
import assert from 'node:assert/strict';
import { invoicePreviewFailureMessage } from '../src/utils/invoicePayload.js';

test('invoice preview exposes backend validation details for HTTP 400', () => {
  assert.equal(
    invoicePreviewFailureMessage({ status: 400, data: { gst: 'Select a valid place of supply.' } }),
    'Invoice preview needs correction: gst: Select a valid place of supply.'
  );
});

test('invoice preview reports authentication and permission failures clearly', () => {
  assert.match(invoicePreviewFailureMessage({ status: 401 }), /session has expired/i);
  assert.match(invoicePreviewFailureMessage({ status: 403 }), /permission/i);
});

test('invoice preview keeps endpoint and network errors actionable', () => {
  assert.match(invoicePreviewFailureMessage({ status: 404 }), /preview API is missing/i);
  assert.match(invoicePreviewFailureMessage({ message: 'Network Error' }), /provisional/i);
});
