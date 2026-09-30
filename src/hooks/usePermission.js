import { useAuth } from './useAuth';
import { hasPermission } from '../utils/permissions';

export const usePermission = (requiredPermission) => {
  const { user } = useAuth();
  return hasPermission(user?.role, requiredPermission);
};
