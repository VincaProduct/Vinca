import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import PrerenderFallback from '@/components/PrerenderFallback';

interface PublicRouteProps {
  children: React.ReactNode;
  /** Where a signed-in visitor is sent instead (default: their Financial Freedom page) */
  signedInTo?: string;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children, signedInTo = '/dashboard/ffr' }) => {
  const { user, loading } = useAuth();

  // Checking whether they're signed in: keep the page's pre-rendered copy on
  // screen (a spinner when navigating inside the app)
  if (loading) return <PrerenderFallback />;

  // If user is logged in, redirect to dashboard
  if (user) {
    return <Navigate to={signedInTo} replace />;
  }

  return <>{children}</>;
};

export default PublicRoute;
