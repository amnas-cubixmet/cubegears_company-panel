import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = (name) => readFileSync(new URL('../' + name, import.meta.url), 'utf8');

test('storage account has one access hook import and keeps paid upload RBAC', () => {
  const text = source('src/pages/saas/SaaSAccount.jsx');
  assert.equal((text.match(/import \{ useFeatureAccess \}/g) || []).length, 1);
  assert.match(text, /can\('storage\.manage'\)/);
  assert.match(text, /serverEvents/);
});
test('storage file audit list has one paginated load-more function', () => {
  const text = source('src/pages/saas/StorageHistory.jsx');
  assert.equal((text.match(/const loadMore = async/g) || []).length, 1);
  assert.match(text, /event\.filename/);
  assert.match(text, /event\.actor \|\| 'System'/);
});
