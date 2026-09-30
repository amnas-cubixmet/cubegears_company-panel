import { mockRolesList } from '../mock/roles.mock';

export const roleService = {
  getRoles: async () => {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...mockRolesList]), 150);
    });
  },

  createRole: async (roleData) => {
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
