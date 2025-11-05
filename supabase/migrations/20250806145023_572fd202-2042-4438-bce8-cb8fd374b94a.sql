-- Fix function to set search_path for security
CREATE OR REPLACE FUNCTION public.get_blog_post_ctas(post_id UUID, post_category TEXT DEFAULT NULL, post_tags TEXT[] DEFAULT NULL)
RETURNS TABLE (
  cta_id UUID,
  cta_name TEXT,
  cta_type cta_type,
  action_type cta_action_type,
  headline TEXT,
  description TEXT,
  button_text TEXT,
  action_url TEXT,
  background_color TEXT,
  text_color TEXT,
  button_color TEXT,
  button_hover_color TEXT,
  background_image TEXT,
  custom_css TEXT,
  icon_name TEXT,
  size TEXT,
  border_radius TEXT,
  open_in_new_tab BOOLEAN,
  display_condition cta_display_condition,
  display_config JSONB,
  placement_position cta_placement_position,
  position_config JSONB,
  priority INTEGER
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    c.id,
    c.name,
    c.type,
    c.action_type,
    c.headline,
    c.description,
    c.button_text,
    c.action_url,
    c.background_color,
    c.text_color,
    c.button_color,
    c.button_hover_color,
    c.background_image,
    c.custom_css,
    c.icon_name,
    c.size,
    c.border_radius,
    c.open_in_new_tab,
    c.display_condition,
    c.display_config,
    p.placement_position,
    p.position_config,
    p.priority
  FROM public.ctas c
  JOIN public.cta_placements p ON c.id = p.cta_id
  WHERE c.status = 'active' 
    AND p.active = true
    AND (
      -- Direct blog post assignment
      p.blog_post_id = post_id
      OR 
      -- Rule-based assignment
      (
        p.blog_post_id IS NULL
        AND (
          post_category = ANY(p.category_filter)
          OR p.category_filter IS NULL
          OR array_length(p.category_filter, 1) IS NULL
        )
        AND (
          p.tag_filter IS NULL
          OR array_length(p.tag_filter, 1) IS NULL
          OR post_tags && p.tag_filter
        )
      )
    )
  ORDER BY p.priority ASC, c.created_at DESC;
$$;