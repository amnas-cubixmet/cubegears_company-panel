import apiClient from '../api/apiClient';
import { isAssignableStaffRole } from '../utils/isAssignableStaffRole';
import {
  permissionCodesToMatrix,
  permissionMatrixToCodes
} from '../config/rolePermissions';

const normalizeRole = (role) => {
  const permissionCodes = Array.isArray(role?.permissions)
    ? role.permissions
    : Array.isArray(role?.permissionCodes)
      ? role.permissionCodes
      : [];

  const protectedRole =
    Boolean(role?.is_system || role?.isProtected) ||
    role?.code === 'SUPER_ADMIN';

  const rawUsersCount =
    role?.usersCount ??
    role?.users_count ??
    (Array.isArray(role?.users) ? role.users.length : 0);
  const parsedUsersCount = Number(rawUsersCount);

  return {
    ...role,
    status: role?.status || (role?.is_active === false ? 'Inactive' : 'Active'),
    isProtected: protectedRole,
    permissionCodes,
    permissions:
      role?.permissions && !Array.isArray(role.permissions)
        ? role.permissions
        : permissionCodesToMatrix(permissionCodes),
    usersCount: Number.isFinite(parsedUsersCount) ? parsedUsersCount : 0
  };
};

const toApiPayload = (roleData) => ({
  name: roleData.name,
  code:
    roleData.code ||
    String(roleData.name || 'ROLE')
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, '_'),
  permissions: Array.isArray(roleData.permissions)
    ? roleData.permissions
    : permissionMatrixToCodes(roleData.permissions),
  is_active: roleData.status ? roleData.status === 'Active' : true
});

export const roleService = {
  getRoles: async () => {
    const rows = await apiClient.get('/roles/');
    const list = Array.isArray(rows) ? rows : rows?.results || [];
    return list.map(normalizeRole);
  },

  // Only real, active staff roles may be assigned to a staff account/profile.
  // The backend scopes GET /roles/ to the logged-in company; never return
  // the protected SUPER_ADMIN owner role or inactive roles in dropdowns.
  getAssignableRoles: async () => {
    const roles = await roleService.getRoles();
    return roles.filter(isAssignableStaffRole);
  },

  previewLegacyRoles: async () => apiClient.get('/roles/legacy-presets/'),

  removeLegacyRoles: async (roleIds) => apiClient.post(
    '/roles/legacy-presets/', { roleIds },
  ),

  createRole: async (roleData) => {
    const created = await apiClient.post('/roles/', toApiPayload(roleData));
    return normalizeRole(created);
  },

  updateRole: async (id, roleData) => {
    if (roleData?.isProtected) {
      throw new Error('Protected owner role cannot be edited.');
    }
    const updated = await apiClient.patch(`/roles/${id}`, toApiPayload(roleData));
    return normalizeRole(updated);
  },

  deleteRole: async (id) => {
    await apiClient.delete(`/roles/${id}`);
  }
};
