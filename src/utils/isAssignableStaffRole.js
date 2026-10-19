// Pure staff-role eligibility predicate so dropdowns never include system,
// inactive, or owner roles. Backend still validates the final assignment.
export const isAssignableStaffRole = (role) =>
  Boolean(role) &&
  role.isProtected !== true &&
  role.is_system !== true &&
  role.is_active !== false &&
  String(role.status || '').toLowerCase() !== 'inactive' &&
  String(role.code || '').toUpperCase() !== 'SUPER_ADMIN';
