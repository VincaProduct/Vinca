import { AuthorsPage } from '@/components/authors/AuthorsPage';
import RoleProtectedRoute from '@/components/RoleProtectedRoute';

const AuthorsDashboard = () => {
  return (
    <RoleProtectedRoute requiredRole="super_admin">
      <AuthorsPage />
    </RoleProtectedRoute>
  );
};

export default AuthorsDashboard;