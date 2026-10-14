import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const parts = readFileSync(new URL('../src/pages/jobs/JobPartsWorkflow.jsx',import.meta.url),'utf8');
test('stock finder uses API stock data and exact selected item identity', () => {
  assert.match(parts,/stockMatches = useMemo/);
  assert.match(parts,/item\.barcode/);
  assert.match(parts,/selectedPartId: item\.id/);
  assert.match(parts,/initialPartId = ''/);
});
test('out of stock uses existing pending-to-order workflow rather than fake stock', () => {
  assert.match(parts,/Buy Outside/);
  assert.match(parts,/onOrder=\{\(\) => setPanel\(\{ type: 'order', line \}\)\}/);
  assert.match(parts,/Out of stock\. Save as a pending requirement/);
  assert.match(parts,/jobPartsService\.createOrder/);
  assert.match(parts,/jobPartsService\.addRequiredPart/);
});
