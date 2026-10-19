import test from 'node:test';
import assert from 'node:assert/strict';
import { companyPermissionModules } from '../src/config/rolePermissions.js';
import { staffInviteDeliveryMessage } from '../src/utils/staffInviteDelivery.js';

test('role editor exposes only exact permissions authorized for the current company', () => {
  const modules = companyPermissionModules(code => ['jobs.view','staff.edit'].includes(code));
  assert.deepEqual(modules.map(module => [module.key,module.actions]), [['jobs',['view']],['staff',['edit']]]);
  assert.deepEqual(companyPermissionModules(() => false), []);
});
test('Celery email statuses do not claim inbox delivery and give recovery instructions', () => {
  assert.match(staffInviteDeliveryMessage('pending'), /transaction.*Celery/);
  assert.match(staffInviteDeliveryMessage('queued'), /queued/);
  assert.match(staffInviteDeliveryMessage('disabled'), /Redis.*Celery/);
  assert.match(staffInviteDeliveryMessage('failed'), /Celery Worker/);
});
