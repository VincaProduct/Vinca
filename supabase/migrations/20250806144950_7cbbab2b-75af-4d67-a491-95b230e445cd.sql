-- Create enum for CTA types
CREATE TYPE cta_type AS ENUM ('button', 'banner', 'inline_text', 'card', 'popup', 'sidebar_widget');

-- Create enum for action types  
CREATE TYPE cta_action_type AS ENUM ('navigate_url', 'download_file', 'open_modal', 'submit_form', 'email_signup');

-- Create enum for placement positions
CREATE TYPE cta_placement_position AS ENUM ('top', 'mid_article', 'bottom', 'sidebar', 'between_paragraphs', 'custom');

-- Create enum for display conditions
CREATE TYPE cta_display_condition AS ENUM ('always', 'time_based', 'scroll_percentage', 'exit_intent', 'mobile_only', 'desktop_only');

-- Create CTAs table
CREATE TABLE public.ctas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type cta_type NOT NULL DEFAULT 'button',
  action_type cta_action_type NOT NULL DEFAULT 'navigate_url',
  
  -- Content fields
  headline TEXT NOT NULL,
  description TEXT,
  button_text TEXT NOT NULL,
  action_url TEXT,
  
  -- Styling fields
  background_color TEXT,
  text_color TEXT,
  button_color TEXT,
  button_hover_color TEXT,
  background_image TEXT,
  custom_css TEXT,
  icon_name TEXT,
  
  -- Configuration
  size TEXT DEFAULT 'medium',
  border_radius TEXT DEFAULT 'md',
  open_in_new_tab BOOLEAN DEFAULT false,
  
  -- Display conditions
  display_condition cta_display_condition DEFAULT 'always',
  display_config JSONB DEFAULT '{}',
  
  -- Status and metadata
  status TEXT DEFAULT 'active',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create CTA placements table for managing where CTAs appear
CREATE TABLE public.cta_placements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cta_id UUID NOT NULL REFERENCES public.ctas(id) ON DELETE CASCADE,
  blog_post_id UUID REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  
  -- Placement configuration
  placement_position cta_placement_position NOT NULL DEFAULT 'bottom',
  position_config JSONB DEFAULT '{}', -- For storing position-specific settings
  priority INTEGER DEFAULT 1,
  
  -- Rule-based assignment (when blog_post_id is null)
  category_filter TEXT[],
  tag_filter TEXT[],
  author_filter UUID[],
  date_filter JSONB,
  
  -- Status
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create CTA analytics table for tracking performance
CREATE TABLE public.cta_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cta_id UUID NOT NULL REFERENCES public.ctas(id) ON DELETE CASCADE,
  blog_post_id UUID REFERENCES public.blog_posts(id) ON DELETE SET NULL,
  
  -- Event tracking
  event_type TEXT NOT NULL, -- 'view', 'click', 'conversion'
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  
  -- Context
  referrer TEXT,
  user_agent TEXT,
  device_type TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create CTA templates table for reusable templates
CREATE TABLE public.cta_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  template_type TEXT NOT NULL, -- 'newsletter_signup', 'product_promotion', etc.
  template_config JSONB NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.ctas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cta_placements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cta_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cta_templates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for CTAs table
CREATE POLICY "Anyone can view active CTAs" ON public.ctas
  FOR SELECT USING (status = 'active');

CREATE POLICY "Super admins can manage CTAs" ON public.ctas
  FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Create RLS policies for CTA placements
CREATE POLICY "Anyone can view active placements" ON public.cta_placements
  FOR SELECT USING (active = true);

CREATE POLICY "Super admins can manage placements" ON public.cta_placements
  FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Create RLS policies for CTA analytics
CREATE POLICY "Super admins can view analytics" ON public.cta_analytics
  FOR SELECT USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Anyone can insert analytics" ON public.cta_analytics
  FOR INSERT WITH CHECK (true);

-- Create RLS policies for CTA templates
CREATE POLICY "Anyone can view templates" ON public.cta_templates
  FOR SELECT USING (true);

CREATE POLICY "Super admins can manage templates" ON public.cta_templates
  FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Create indexes for performance
CREATE INDEX idx_ctas_status ON public.ctas(status);
CREATE INDEX idx_ctas_type ON public.ctas(type);
CREATE INDEX idx_cta_placements_blog_post ON public.cta_placements(blog_post_id);
CREATE INDEX idx_cta_placements_cta ON public.cta_placements(cta_id);
CREATE INDEX idx_cta_placements_active ON public.cta_placements(active);
CREATE INDEX idx_cta_analytics_cta ON public.cta_analytics(cta_id);
CREATE INDEX idx_cta_analytics_blog_post ON public.cta_analytics(blog_post_id);
CREATE INDEX idx_cta_analytics_event_type ON public.cta_analytics(event_type);
CREATE INDEX idx_cta_analytics_created_at ON public.cta_analytics(created_at);

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_ctas_updated_at
  BEFORE UPDATE ON public.ctas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cta_placements_updated_at
  BEFORE UPDATE ON public.cta_placements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cta_templates_updated_at
  BEFORE UPDATE ON public.cta_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to get CTAs for a blog post
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