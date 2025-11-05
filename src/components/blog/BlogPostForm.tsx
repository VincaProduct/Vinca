
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useBlogPosts } from '@/hooks/useBlogPosts';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { PostDetailsForm } from './PostDetailsForm';
import { AuthorSelect } from './AuthorSelect';
import { ContentForm } from './ContentForm';
import { PostFormActions } from './PostFormActions';
import { TOCEditor, type TOCItem } from './TOCEditor';
import { CTASelectionForm } from './CTASelectionForm';
import type { Tables } from '@/integrations/supabase/types';

type BlogPost = Tables<'blog_posts'>;

interface BlogPostFormProps {
  post?: BlogPost | null;
  onClose: () => void;
}

export const BlogPostForm = ({ post, onClose }: BlogPostFormProps) => {
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    content: '',
    excerpt: '',
    slug: '',
    category: '',
    featured_image: '',
    read_time: '5 min read',
    status: 'draft' as 'draft' | 'published' | 'archived',
    author_id: '',
    table_of_contents: [] as TOCItem[],
  });
  const [saving, setSaving] = useState(false);
  const { createPost, updatePost } = useBlogPosts();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title,
        subtitle: post.subtitle || '',
        content: post.content,
        excerpt: post.excerpt || '',
        slug: post.slug,
        category: post.category,
        featured_image: post.featured_image || '',
        read_time: post.read_time || '5 min read',
        status: post.status as 'draft' | 'published' | 'archived' || 'draft',
        author_id: post.author_id || '',
        table_of_contents: (post.table_of_contents as unknown as TOCItem[]) || [],
      });
    }
  }, [post]);

  const updateFormData = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleFeaturedImageUploaded = (url: string) => {
    updateFormData({ featured_image: url });
  };

  const handleFeaturedImageRemoved = () => {
    updateFormData({ featured_image: '' });
  };

  const handleSave = async (status: 'draft' | 'published') => {
    if (!formData.title || !formData.content || !formData.category || !formData.slug || !formData.author_id) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields including selecting an author',
        variant: 'destructive',
      });
      return;
    }

    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to save posts',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const postData = {
        ...formData,
        status,
        published_at: status === 'published' ? new Date().toISOString() : null,
        table_of_contents: formData.table_of_contents as any,
        // Legacy fields for backward compatibility
        author_name: '',
        author_title: '',
        author_bio: '',
        author_image: '',
      };

      if (post) {
        await updatePost(post.id, postData);
        toast({
          title: 'Success',
          description: 'Post updated successfully',
        });
      } else {
        await createPost(postData);
        toast({
          title: 'Success',
          description: 'Post created successfully',
        });
      }

      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save post',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-4xl">
      <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
        <Button variant="outline" onClick={onClose} size="sm" className="shrink-0">
          <ArrowLeft className="w-4 h-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Back</span>
        </Button>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold truncate">
          {post ? 'Edit Post' : 'Create New Post'}
        </h1>
      </div>

      <div className="grid gap-4 sm:gap-6">
        <PostDetailsForm
          formData={{
            title: formData.title,
            subtitle: formData.subtitle,
            slug: formData.slug,
            category: formData.category,
            read_time: formData.read_time,
            featured_image: formData.featured_image,
            excerpt: formData.excerpt,
          }}
          onUpdate={updateFormData}
          onFeaturedImageUploaded={handleFeaturedImageUploaded}
          onFeaturedImageRemoved={handleFeaturedImageRemoved}
        />

        <AuthorSelect
          value={formData.author_id}
          onChange={(authorId) => updateFormData({ author_id: authorId })}
        />

        <ContentForm
          content={formData.content}
          onContentChange={(content) => updateFormData({ content })}
        />

        <TOCEditor
          items={formData.table_of_contents}
          onItemsChange={(table_of_contents) => updateFormData({ table_of_contents })}
        />

        <CTASelectionForm
          blogPostId={post?.id}
        />

        <PostFormActions
          onSaveDraft={() => handleSave('draft')}
          onPublish={() => handleSave('published')}
          saving={saving}
        />
      </div>
    </div>
  );
};
