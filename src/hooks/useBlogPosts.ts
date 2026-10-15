
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Tables } from '@/integrations/supabase/types';
import { readSsrData } from '@/lib/ssrData';

type BlogPost = Tables<'blog_posts'>;

// Card/list fields only: listing components never need the full post body
const LISTING_COLUMNS = 'id,title,slug,excerpt,featured_image,category,read_time,published_at,created_at';

// Shared by the grid, category filter and popular articles on the same page,
// and seeded from the server-rendered blog listing when available
let publishedPostsRequest: Promise<BlogPost[]> | null = null;
let publishedPostsRequestedAt = 0;

const loadPublishedPosts = () => {
  if (!publishedPostsRequest || Date.now() - publishedPostsRequestedAt > 60_000) {
    publishedPostsRequestedAt = Date.now();
    const seeded = publishedPostsRequest ? null : readSsrData<BlogPost[]>('blog-list-data');
    publishedPostsRequest = seeded
      ? Promise.resolve(seeded)
      : Promise.resolve(
          supabase
            .from('blog_posts')
            .select(LISTING_COLUMNS)
            .eq('status', 'published')
            .order('published_at', { ascending: false }),
        ).then(({ data, error }) => {
          if (error) {
            publishedPostsRequest = null;
            throw error;
          }
          return (data || []) as unknown as BlogPost[];
        });
  }
  return publishedPostsRequest;
};

export const useBlogPosts = () => {
  const [posts, setPosts] = useState<BlogPost[]>(() => readSsrData<BlogPost[]>('blog-list-data') || []);
  const [loading, setLoading] = useState(() => !readSsrData('blog-list-data'));
  const [error, setError] = useState<string | null>(null);

  /** Published posts with listing fields only (no content) */
  const fetchPublishedPosts = async () => {
    try {
      if (posts.length === 0) setLoading(true);
      setPosts(await loadPublishedPosts());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPosts = async () => {
    try {
      setLoading(true);
      // This will work for super admins due to RLS policies
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching user posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const getPostBySlug = async (slug: string) => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select(`
          *,
          author:authors(*)
        `)
        .eq('slug', slug)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (err) {
      // Rethrown so a failed request isn't mistaken for a missing post
      console.error('Error fetching post:', err);
      throw err;
    }
  };

  const createPost = async (postData: Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .insert(postData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to create post');
    }
  };

  const updatePost = async (id: string, postData: Partial<Omit<BlogPost, 'id' | 'created_at'>>) => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .update(postData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update post');
    }
  };

  const deletePost = async (id: string) => {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to delete post');
    }
  };

  return {
    posts,
    loading,
    error,
    fetchPublishedPosts,
    fetchUserPosts,
    getPostBySlug,
    createPost,
    updatePost,
    deletePost,
  };
};
