import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = (path) => readFileSync(new URL('../' + path, import.meta.url), 'utf8');

test('storage account loads tenant-scoped interval records from Django and shows hours', () => {
  const service = source('src/services/storageHistory.service.js');
  const page = source('src/pages/saas/SaaSAccount.jsx');
  assert.match(service, /getStorageIntervalLogs/);
  assert.match(service, /\/saas\/storage\/interval-logs\?/);
  assert.match(page, /refreshIntervals/);
  assert.match(page, /Storage interval logs/);
  assert.match(page, /meterIntervalHours/);
  assert.match(page, /intervalLogs\.map\(row =>/);
  assert.match(page, /row\.accruedCredits == null \? 'Not billed'/);
});
