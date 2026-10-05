import apiClient from '../api/apiClient';
import { USE_MOCK_API } from '../api/apiConfig';
import { mockRolesList } from '../mock/roles.mock';

export const roleService = {
  getRoles: async () => {
    if (!USE_MOCK_API) return apiClient.get('/roles/');
    return new Promise((resolve) => {
      setTimeout(() => resolve([...mockRolesList]), 150);
    });
  },

  createRole: async (roleData) => {
    if (!USE_MOCK_API) {
      const payload = {
        name: roleData.name,
        code: roleData.code || String(roleData.name || 'ROLE').toUpperCase().replace(/[^A-Z0-9]+/g, '_'),
        permissions: roleData.permissions || roleData.permissionCodes || [],
        is_active: roleData.status ? roleData.status === 'Active' : true
      };
      return apiClient.post('/roles/', payload);
    }
    return new Promise((resolve) => {
      setTimeout(() => {
        const newRole = {
          ...roleData,
          id: `ROLE-${String(mockRolesList.length + 1).padStart(2, '0')}`,
          usersCount: 0,
          isProtected: false,
          status: 'Active'
        };
        mockRolesList.push(newRole);
        resolve(newRole);
      }, 200);
    });
  },

  updateRole: async (id, roleData) => {
    if (!USE_MOCK_API) {
      const payload = {
        ...roleData,
        is_active: roleData.status ? roleData.status === 'Active' : roleData.is_active
      };
      return apiClient.patch(`/roles/${id}`, payload);
    }
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const idx = mockRolesList.findIndex((r) => r.id === id);
        if (idx !== -1) {
          if (mockRolesList[idx].isProtected && roleData.status === 'Inactive') {
            return reject(new Error('Company Owner role is protected and cannot be deactivated.'));
          }
          mockRolesList[idx] = { ...mockRolesList[idx], ...roleData };
          resolve(mockRolesList[idx]);
        } else {
          reject(new Error('Role not found'));
        }
      }, 200);
    });
  }
};
