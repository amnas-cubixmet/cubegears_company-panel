import apiClient from '../api/apiClient';
import { USE_MOCK_API } from '../api/apiConfig';
import { mockRolesList } from '../mock/roles.mock';
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
    description:
      role?.description ||
      (protectedRole ? 'Company owner with automatic full access.' : ''),
    branchScope: role?.branchScope || 'Assigned Branch Only',
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
    if (!USE_MOCK_API) {
      const rows = await apiClient.get('/roles/');
      const list = Array.isArray(rows) ? rows : rows?.results || [];
      return list.map(normalizeRole);
    }

    return new Promise((resolve) => {
      setTimeout(() => resolve(mockRolesList.map(normalizeRole)), 150);
    });
  },

  createRole: async (roleData) => {
    if (!USE_MOCK_API) {
      const created = await apiClient.post('/roles/', toApiPayload(roleData));
      return normalizeRole(created);
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        const newRole = normalizeRole({
          ...roleData,
          id: `ROLE-${String(mockRolesList.length + 1).padStart(2, '0')}`,
          usersCount: 0,
          isProtected: false,
          status: 'Active'
        });
        mockRolesList.push(newRole);
        resolve(newRole);
      }, 200);
    });
  },

  updateRole: async (id, roleData) => {
    if (roleData?.isProtected) {
      throw new Error('Company Super Admin is protected and always has full access.');
    }

    if (!USE_MOCK_API) {
      const updated = await apiClient.patch(`/roles/${id}`, toApiPayload(roleData));
      return normalizeRole(updated);
    }

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const idx = mockRolesList.findIndex((role) => role.id === id);
        if (idx === -1) return reject(new Error('Role not found.'));
        if (mockRolesList[idx].isProtected) {
          return reject(new Error('Company Super Admin is protected and cannot be edited.'));
        }

        mockRolesList[idx] = normalizeRole({
          ...mockRolesList[idx],
          ...roleData
        });
        resolve(mockRolesList[idx]);
      }, 200);
    });
  }
};
