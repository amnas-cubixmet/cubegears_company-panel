// Owner identity and shop details remain available before module activation.
export const PURCHASE_ACCOUNT_PATHS = new Set([
  '/account', '/account/credits/buy', '/account/credits/features', '/account/credits/logs',
  '/account/billing', '/account/plans', '/profile', '/account/company',
]);

export const isAccountPath = (pathname = '') => pathname === '/account' || pathname.startsWith('/account/');

export const isAccountOnly = (access) => Boolean(
  access && !access.unavailable && (access.enforced || access.paidAccessRequired || access.labelOnly)
  && Array.isArray(access.modules) && access.modules.length === 0
);

export function setupRedirect(access, pathname) {
  if (!isAccountOnly(access)) return null;
  if (!access.isCompanyOwner) return pathname === '/access-denied' ? null : '/access-denied';
  const normalized = pathname.replace(/\/+$/, '') || '/';
  return PURCHASE_ACCOUNT_PATHS.has(normalized) ? null : '/account';
}
