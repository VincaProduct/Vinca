-- Article views no longer count the article's own writer or super admins, so
-- the numbers members show on their profile and CV come from other readers.

create or replace function public.record_blog_post_view(_post_id uuid)
returns void
language sql
volatile
security definer
set search_path = public
as $$
  insert into public.blog_post_views (post_id, day, views)
  select p.id, current_date, 1
  from public.blog_posts p
  where p.id = _post_id
    and p.status = 'published'
    -- Not the writer reading their own article
    and (auth.uid() is null or p.submitted_by is distinct from auth.uid())
    -- Not the Vinca team (super admins)
    and (auth.uid() is null or not public.has_role(auth.uid(), 'super_admin'::app_role))
  on conflict (post_id, day) do update set views = public.blog_post_views.views + 1
$$;

revoke all on function public.record_blog_post_view(uuid) from public;
grant execute on function public.record_blog_post_view(uuid) to anon, authenticated;
