-- Draft and archived blog posts were readable by every signed-in user: the
-- policy "Anyone can read published blog posts" also allowed
-- "auth.uid() IS NOT NULL". Now:
--   - published posts: everyone (policy "Anyone can view published posts", unchanged)
--   - all posts: super admins (new policy below)
--   - their own posts: Expert Panel members ("Panel members read own posts", from 20261126000000)
--
-- Undo:
--   create policy "Anyone can read published blog posts" on public.blog_posts for select
--     using ((status = 'published'::text) or (auth.uid() is not null));
--   drop policy "Super admins read all blog posts" on public.blog_posts;

drop policy if exists "Super admins read all blog posts" on public.blog_posts;
create policy "Super admins read all blog posts" on public.blog_posts for select to authenticated
  using (public.has_role(auth.uid(), 'super_admin'::app_role));

drop policy if exists "Anyone can read published blog posts" on public.blog_posts;
