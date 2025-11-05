
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, ShieldAlert } from 'lucide-react';
import { useBlogPosts } from '@/hooks/useBlogPosts';
import { BlogPostForm } from './BlogPostForm';
import { PostsList } from './PostsList';
import { useToast } from '@/hooks/use-toast';
import { useUserRole } from '@/hooks/useUserRole';
import type { Tables } from '@/integrations/supabase/types';

type BlogPost = Tables<'blog_posts'>;

const BlogCMS = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const { posts, loading, fetchUserPosts, deletePost } = useBlogPosts();
  const { toast } = useToast();
  const { isSuperAdmin, loading: roleLoading } = useUserRole();

  useEffect(() => {
    if (isSuperAdmin) {
      fetchUserPosts();
    }
  }, [isSuperAdmin]);

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this post?')) {
      try {
        await deletePost(id);
        toast({
          title: 'Success',
          description: 'Post deleted successfully',
        });
        fetchUserPosts();
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to delete post',
          variant: 'destructive',
        });
      }
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingPost(null);
    fetchUserPosts();
  };

  const handleCreateNew = () => {
    setShowForm(true);
  };

  // Show loading while checking role
  if (roleLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show access denied if not super admin
  if (!isSuperAdmin) {
    return (
      <div className="text-center space-y-4 p-8">
        <ShieldAlert className="h-16 w-16 text-destructive mx-auto" />
        <h2 className="text-2xl font-bold text-foreground">Access Denied</h2>
        <p className="text-muted-foreground">
          You need super admin privileges to access the Blog CMS.
        </p>
      </div>
    );
  }

  if (showForm) {
    return (
      <BlogPostForm
        post={editingPost}
        onClose={handleFormClose}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-foreground">Your Posts</h2>
          <p className="text-muted-foreground text-sm sm:text-base">Manage your blog content</p>
        </div>
        <Button onClick={handleCreateNew} className="flex items-center gap-2 w-full sm:w-auto">
          <PlusCircle className="w-4 h-4" />
          <span className="sm:inline">New Post</span>
        </Button>
      </div>

      <PostsList
        posts={posts}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCreateNew={handleCreateNew}
      />
    </div>
  );
};

export default BlogCMS;
