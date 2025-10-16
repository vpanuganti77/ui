import { useAuth } from '../context/AuthContext';
import { Permission, ROLE_PERMISSIONS, UserRole } from '../types/roles';

export const usePermissions = () => {
  const { user } = useAuth();

  const hasPermission = (permission: Permission): boolean => {
    if (!user?.role) return false;
    
    const userRole = user.role as UserRole;
    const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
    
    return rolePermissions.includes(permission);
  };

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some(permission => hasPermission(permission));
  };

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return permissions.every(permission => hasPermission(permission));
  };

  const canAccess = (requiredPermissions: Permission | Permission[]): boolean => {
    if (Array.isArray(requiredPermissions)) {
      return hasAnyPermission(requiredPermissions);
    }
    return hasPermission(requiredPermissions);
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccess,
    userRole: user?.role as UserRole,
    isMasterAdmin: user?.role === UserRole.MASTER_ADMIN,
    isAdmin: user?.role === UserRole.ADMIN,
    isReceptionist: user?.role === UserRole.RECEPTIONIST,
    isTenant: user?.role === UserRole.TENANT
  };
};