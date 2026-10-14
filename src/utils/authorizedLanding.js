import { routeConfig } from '../routes/routeConfig.js';
import { getPermissionForPath, hasPermission } from './permissions.js';

export const getDefaultAuthorizedRoute = (user) =>
  routeConfig.find((route) => hasPermission(user, route.permission))?.path || '/access-denied';

const PUBLIC_AUTH_PATHS = new Set([
  '/login', '/signup', '/forgot-password', '/reset-password', '/setup-password', '/magic-link/verify'
]);

export const getSafePostLoginDestination = (next, user) => {
  const fallback = getDefaultAuthorizedRoute(user);
  if (typeof next !== 'string' || !next.startsWith('/') || next.startsWith('//') || next.includes('\\')) {
    return fallback;
  }

  try {
    const target = new URL(next, 'https://cubixgear.invalid');
    if (target.origin !== 'https://cubixgear.invalid' || PUBLIC_AUTH_PATHS.has(target.pathname)) {
      return fallback;
    }
    const permission = getPermissionForPath(target.pathname);
    const knownRoute = routeConfig.some((route) =>
      target.pathname === route.path || target.pathname.startsWith(route.path + '/')
    );
    if ((!knownRoute && !permission && target.pathname !== '/' && target.pathname !== '/profile') ||
      (permission && !hasPermission(user, permission))) {
      return fallback;
    }
    return target.pathname + target.search + target.hash;
  } catch {
    return fallback;
  }
};
