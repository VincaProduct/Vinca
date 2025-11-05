-- Add table_of_contents column to blog_posts table
ALTER TABLE public.blog_posts 
ADD COLUMN table_of_contents JSONB DEFAULT '[]'::jsonb;