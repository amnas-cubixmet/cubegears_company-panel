import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL('../' + path, import.meta.url), 'utf8');

test('credit purchases guard rapid double clicks before React state updates', () => {
  const source = read('src/pages/saas/CreditWorkspace.jsx');
  assert.match(source, /purchaseInFlightRef = useRef\(false\)/);
  assert.match(source, /purchaseInFlightRef\.current \|\| busy/);
  assert.match(source, /purchaseInFlightRef\.current = true/);
  assert.match(source, /purchaseInFlightRef\.current = false/);
  assert.match(source, /purchaseRetryAt > Date\.now\(\)/);
});

test('purchase action respects server 429 rather than replaying mutations', () => {
  const source = read('src/pages/saas/CreditWorkspace.jsx');
  const client = read('src/api/apiClient.js');
  assert.match(client, /normalized\.retryAfterSeconds = Math\.ceil\(retrySeconds\)/);
  assert.match(source, /e\?\.status === 429/);
  assert.match(source, /e\?\.retryAfterSeconds/);
  assert.match(source, /No automatic retry was made/);
  assert.doesNotMatch(source, /window\.setInterval\(.*purchaseBundle/);
});
