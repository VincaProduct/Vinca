-- Drop the existing foreign key constraint that references auth.users
ALTER TABLE public.blog_posts 
DROP CONSTRAINT IF EXISTS blog_posts_author_id_fkey;

-- Set author_id to NULL for existing posts since they were referencing users table
UPDATE public.blog_posts 
SET author_id = NULL 
WHERE author_id IS NOT NULL;

-- Add the correct foreign key constraint that references authors table
ALTER TABLE public.blog_posts 
ADD CONSTRAINT blog_posts_author_id_fkey 
FOREIGN KEY (author_id) REFERENCES public.authors(id);