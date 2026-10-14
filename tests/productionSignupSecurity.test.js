import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL('../' + path, import.meta.url), 'utf8');

test('company signup is a public route connected to the Django endpoint', () => {
  const routes = read('src/routes/AppRoutes.jsx');
  const signup = read('src/pages/auth/Signup.jsx');
  assert.match(routes, /path="\/signup" element={<Signup \/>}/);
  assert.match(signup, /apiClient\.post\('\/auth\/signup'/);
  assert.match(signup, /company's Super Admin/);
});

test('production disables mock auth and requires configured real backend', () => {
  const config = read('src/api/apiConfig.js');
  const vite = read('vite.config.js');
  assert.match(config, /!import\.meta\.env\.PROD/);
  assert.match(vite, /Production build requires VITE_API_URL/);
});

test('frontend RBAC does not promote platform superusers', () => {
  const permissions = read('src/utils/permissions.js');
  assert.doesNotMatch(permissions, /if \(user\?\.is_superuser\) return/);
  assert.match(permissions, /permissions\.includes\('\*'\)/);
});

test('branch-specific permissions are not claimed without backend enforcement', () => {
  const editor = read('src/components/staff-management/RoleEditorForm.jsx');
  assert.match(editor, /Branch-specific restrictions are not available yet/);
  assert.doesNotMatch(editor, /<option value="Selected Branches">/);
});
