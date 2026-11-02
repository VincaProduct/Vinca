
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    // After signing in, come back to the page the visitor asked for (for
    // example a blog's "Book now" link to Compass), not the default page
    localStorage.setItem('redirect_after_login', location.pathname + location.search + location.hash);
    if (location.pathname.startsWith('/dashboard/compass')) {
      sessionStorage.setItem('auth_context_consultation', 'true');
    }
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
