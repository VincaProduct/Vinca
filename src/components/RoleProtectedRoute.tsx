
import { useUserRole } from '@/hooks/useUserRole';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, ShieldAlert } from 'lucide-react';
import { Navigate, useLocation } from 'react-router-dom';
import type { Database } from '@/integrations/supabase/types';

type UserRole = Database['public']['Enums']['app_role'];

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  requiredRole: UserRole;
  fallbackPath?: string;
}

const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({ 
  children, 
  requiredRole, 
  fallbackPath = '/dashboard' 
}) => {
  const { user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading, isSuperAdmin, isAdmin } = useUserRole();
  const location = useLocation();

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Check role permissions
  const hasPermission = () => {
    switch (requiredRole) {
      case 'super_admin':
        return isSuperAdmin;
      case 'admin':
        return isAdmin;
      case 'user':
        return role !== null;
      default:
        return false;
    }
  };

  if (!hasPermission()) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="text-center space-y-4 max-w-md">
          <ShieldAlert className="h-16 w-16 text-destructive mx-auto" />
          <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
          <p className="text-muted-foreground">
            You don't have the required permissions to access this page. 
            This page requires {requiredRole.replace('_', ' ')} role.
          </p>
          <p className="text-sm text-muted-foreground">
            Your current role: {role || 'No role assigned'}
          </p>
          <div className="pt-4">
            <button
              onClick={() => window.history.back()}
              className="text-primary hover:underline"
            >
              Go back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default RoleProtectedRoute;
