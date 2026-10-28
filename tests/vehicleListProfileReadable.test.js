import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(new URL('../'+path, import.meta.url),'utf8');
const list = read('src/pages/vehicles/VehicleList.jsx');
const details = read('src/pages/vehicles/VehicleDetails.jsx');
const search = read('src/components/vehicles/VehicleSearchToolbar.jsx');
const styles = read('src/styles/vehicle-readable.css');

test('both Vehicle List and Profile apply scoped readable styling last', () => {
  for (const page of [list,details]) {
    assert.match(page,/import '..\/..\/styles\/vehicle-management.css'/);
    assert.match(page,/import '..\/..\/styles\/vehicle-readable.css'/);
    assert.ok(page.indexOf('vehicle-management.css') < page.indexOf('vehicle-readable.css'));
  }
  assert.match(list,/vehicle-management-page cg-vehicles vehicle-dashboard/);
  assert.match(details,/vehicle-management-page vehicle-profile-page cg-vehicles/);
});

test('vehicle search input has no double border; focus outline belongs to wrapper', () => {
  assert.match(search,/aria-label="Search vehicles"/);
  assert.match(search,/type="search"/);
  assert.match(styles,/\.vehicle-dashboard-search input:focus-visible/);
  assert.match(styles,/border: 0 !important/);
  assert.match(styles,/outline: none !important/);
  assert.match(styles,/box-shadow: none !important/);
  assert.match(styles,/\.vehicle-dashboard-search:focus-within/);
});

test('readable desktop list metrics, search, table and section headings', () => {
  for (const selector of [
    '.vehicle-dashboard-header h1',
    '.vehicle-dashboard-header p',
    '.vehicle-dashboard-stat-top span',
    '.vehicle-dashboard-stat-card > small',
    '.vehicle-dashboard-search input',
    '.vehicle-dashboard-section-title h2',
    '.vehicle-table th',
    '.vehicle-table td',
    '.vehicle-table td strong',
    '.vehicle-table-job',
  ]) assert.ok(styles.includes(selector), 'Missing list selector: '+selector);
  assert.match(styles,/font-size: 16px !important/);
  assert.match(styles,/font-size: 14px !important/);
  assert.match(styles,/min-height: 46px/);
});

test('vehicle profile summary and every tab have readable text and large tap areas', () => {
  for (const selector of [
    '.vehicle-profile-header h1',
    '.vehicle-profile-actions button',
    '.vehicle-current-job strong',
    '.vehicle-profile-kpis span',
    '.vehicle-profile-kpis strong',
    '.vehicle-profile-tabs button',
    '.vehicle-section-header h2',
    '.vehicle-info-card strong',
    '.vehicle-owner-profile strong',
    '.vehicle-history-card__meta span',
    '.vehicle-part-card__meta span',
    '.vehicle-invoice-row > div:not(:first-child) b',
    '.vehicle-reminder-card small',
  ]) assert.ok(styles.includes(selector), 'Missing profile selector: '+selector);
  assert.match(styles, /min-height: 44px/);
  assert.match(styles, /font-size: 19px !important/);
});

test('small screens use cards, wrap values and avoid whole page horizontal scroll', () => {
  assert.match(styles,/@media \(max-width: 767px\)/);
  assert.match(styles,/@media \(max-width: 420px\)/);
  assert.match(styles,/\.vehicle-mobile-meta strong \{[\s\S]*?white-space: normal/);
  assert.match(styles,/\.vehicle-card-actions \{ display: grid; grid-template-columns: repeat\(2/);
  assert.match(styles,/\.vehicle-profile-kpis \{ grid-template-columns: repeat\(2/);
  assert.match(styles,/\.vehicle-two-column \{ grid-template-columns: minmax\(0, 1fr\)/);
  assert.match(styles,/\.vehicle-profile-tabs \{ scrollbar-width: thin/);
});
