-- Fix function security - add search_path to all security definer functions

-- Fix get_blog_post_ctas function
CREATE OR REPLACE FUNCTION public.get_blog_post_ctas(post_id uuid, post_category text DEFAULT NULL::text, post_tags text[] DEFAULT NULL::text[])
RETURNS TABLE(cta_id uuid, cta_name text, cta_type cta_type, action_type cta_action_type, headline text, description text, button_text text, action_url text, background_color text, text_color text, button_color text, button_hover_color text, background_image text, custom_css text, icon_name text, size text, border_radius text, open_in_new_tab boolean, display_condition cta_display_condition, display_config jsonb, placement_position cta_placement_position, position_config jsonb, priority integer)
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
      p.blog_post_id = post_id
      OR 
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

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Fix handle_new_user_role function
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;

-- Fix handle_new_user function  
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  full_name_value TEXT;
  space_position INTEGER;
BEGIN
  full_name_value := NEW.raw_user_meta_data->>'full_name';
  
  IF full_name_value IS NOT NULL AND full_name_value != '' THEN
    space_position := POSITION(' ' IN full_name_value);
    
    IF space_position > 0 THEN
      INSERT INTO public.profiles (id, email, full_name, first_name, last_name, zoho_sync_status)
      VALUES (
        NEW.id, 
        NEW.email, 
        full_name_value,
        TRIM(SUBSTRING(full_name_value FROM 1 FOR space_position - 1)),
        TRIM(SUBSTRING(full_name_value FROM space_position + 1)),
        'pending'
      );
    ELSE
      INSERT INTO public.profiles (id, email, full_name, first_name, last_name, zoho_sync_status)
      VALUES (
        NEW.id, 
        NEW.email, 
        full_name_value,
        '',
        TRIM(full_name_value),
        'pending'
      );
    END IF;
  ELSE
    INSERT INTO public.profiles (id, email, full_name, zoho_sync_status)
    VALUES (NEW.id, NEW.email, full_name_value, 'pending');
  END IF;
  
  RETURN NEW;
END;
$$;