
import BlogCMS from '@/components/blog/BlogCMS';
import RoleProtectedRoute from '@/components/RoleProtectedRoute';

const BlogCMSDashboard = () => {
  return (
    <RoleProtectedRoute requiredRole="super_admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Blog Management
          </h1>
          <p className="text-muted-foreground">
            Create and manage your blog posts from your dashboard.
          </p>
        </div>
        
        <BlogCMS />
      </div>
    </RoleProtectedRoute>
  );
};

export default BlogCMSDashboard;
