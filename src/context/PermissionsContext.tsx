import { createContext, useContext } from 'react';
import { UserRole } from '../../types';

interface PermissionsContextType {
  canAccess: (resource: string) => boolean;
  canEdit: (resource: string) => boolean;
  canDelete: (resource: string) => boolean;
  canAdmin: (resource: string) => boolean;
  role: UserRole | null;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

const rolePermissions: Record<UserRole, string[]> = {
  admin: ['*'],
  tutor: [
    'view-students',
    'edit-students',
    'create-resources',
    'edit-resources',
    'delete-resources',
    'schedule-sessions',
    'assign-homework',
    'award-points',
    'view-analytics',
    'schedule-calendar',
    'manage-assessments',
  ],
  student: [
    'view-own-profile',
    'view-own-progress',
    'purchase-items',
    'equip-items',
    'activate-boosters',
    'view-achievements',
    'view-leaderboard',
    'view-resources',
    'view-schedule',
    'send-messages',
  ],
  parent: [
    'view-child-profile',
    'view-child-progress',
    'view-resources',
    'view-schedule',
    'view-assessments',
    'view-leaderboard',
    'send-messages',
  ],
};

export const PermissionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const canAccess = (resource: string): boolean => {
    if (!user) return false;
    const permissions = rolePermissions[user.role] || [];
    return permissions.includes('*') || permissions.includes(resource);
  };

  const canEdit = (resource: string): boolean => {
    if (!user) return false;
    const permissions = rolePermissions[user.role] || [];
    return permissions.includes('*') || permissions.some(p => p.startsWith('edit-'));
  };

  const canDelete = (resource: string): boolean => {
    return canEdit(resource);
  };

  const canAdmin = (resource: string): boolean => {
    return user?.role === 'admin';
  };

  return (
    <PermissionsContext.Provider value={{
      canAccess,
      canEdit,
      canDelete,
      canAdmin,
      role: user?.role || null,
    }}>
      {children}
    </PermissionsContext.Provider>
  );
};

export const usePermissions = (): PermissionsContextType => {
  const context = useContext(PermissionsContext);
  if (context === undefined) {
    throw new Error('usePermissions must be used within a PermissionsProvider');
  }
  return context;
};
