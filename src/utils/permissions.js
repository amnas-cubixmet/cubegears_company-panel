import { ROLES } from '../config/roleConfig';

export const hasPermission = (userRole, requiredPermission) => {
  if (!userRole || !requiredPermission) return false;
  const rolePermissions = ROLES[userRole] || [];
  return rolePermissions.includes(requiredPermission);
};
