export const getUserRoleLabel = (user, fallback = 'ADMIN') => {
  const role = user?.role;

  if (!role) return fallback;
  if (typeof role === 'string') return role;
  if (typeof role === 'object') {
    return role.name || role.code || fallback;
  }

  return String(role || fallback);
};
