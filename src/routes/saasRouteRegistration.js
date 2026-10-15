import { Cloud } from 'lucide-react';
import { routeConfig, mobileMoreRoutes, ROUTE_SECTIONS } from './routeConfig';

const accountRoute = {
  id: 'saas-account',
  label: 'Credits & Account',
  path: '/account',
  icon: Cloud,
  section: ROUTE_SECTIONS.ANALYTICS_SYSTEM,
  mobilePrimary: false,
  permission: 'billing.view',
  children: [
    { id: 'credits-overview', label: 'Credit Overview', path: '/account' },
    { id: 'credits-buy', label: 'Buy Credits', path: '/account/credits/buy' },
    { id: 'credits-features', label: 'Feature Controls', path: '/account/credits/features' },
    { id: 'credits-storage', label: 'Storage', path: '/account/storage' },
    { id: 'credits-logs', label: 'Credit Logs', path: '/account/credits/logs' }
  ]
};

if (!routeConfig.some((route) => route.id === accountRoute.id)) routeConfig.splice(routeConfig.length - 1, 0, accountRoute);
if (!mobileMoreRoutes.some((route) => route.id === accountRoute.id)) mobileMoreRoutes.push(accountRoute);
