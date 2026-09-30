import { Cloud } from 'lucide-react';
import { routeConfig, mobileMoreRoutes, ROUTE_SECTIONS } from './routeConfig';

const accountRoute = {
  id: 'saas-account',
  label: 'SaaS Account',
  path: '/account',
  icon: Cloud,
  section: ROUTE_SECTIONS.ANALYTICS_SYSTEM,
  mobilePrimary: false,
  permission: 'settings.manage',
  children: [
    { id: 'saas-plan', label: 'Plan & Usage', path: '/account/billing' },
    { id: 'saas-storage', label: 'Media Storage', path: '/account/storage' }
  ]
};

if (!routeConfig.some((route) => route.id === accountRoute.id)) routeConfig.splice(routeConfig.length - 1, 0, accountRoute);
if (!mobileMoreRoutes.some((route) => route.id === accountRoute.id)) mobileMoreRoutes.push(accountRoute);
