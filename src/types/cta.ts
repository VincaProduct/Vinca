import type { Tables } from '@/integrations/supabase/types';

// CTA types from database
export type CTA = Tables<'ctas'>;
export type CTAPlacement = Tables<'cta_placements'>;
export type CTAAnalytics = Tables<'cta_analytics'>;
export type CTATemplate = Tables<'cta_templates'>;

// Enum types for better type safety
export type CTAType = 'button' | 'banner' | 'card';
export type CTAActionType = 'navigate_url' | 'download_file' | 'email_signup';
export type CTAPlacementPosition = 'top' | 'bottom' | 'below_toc' | 'middle_article' | 'inline_marker';
export type CTADisplayCondition = 'always' | 'time_based' | 'scroll_percentage' | 'exit_intent' | 'mobile_only' | 'desktop_only';

// Extended CTA type with placement info for rendering
export interface CTAWithPlacement extends CTA {
  placement_position: CTAPlacementPosition | CTAPlacementPosition[];
  position_config: Record<string, any>;
  priority: number;
}

// CTA form data type
export interface CTAFormData {
  name: string;
  type: CTAType;
  action_type: CTAActionType;
  headline: string;
  description?: string;
  button_text: string;
  action_url?: string;
  open_in_new_tab: boolean;
  status: string;
}

// CTA placement form data (for UI form)
export interface CTAPlacementFormData {
  cta_id: string;
  blog_post_id?: string;
  placement_position: CTAPlacementPosition[];
  position_config: Record<string, any>;
  priority: number;
  category_filter?: string[];
  tag_filter?: string[];
  active: boolean;
}

// CTA placement data for database operations (single position)
export interface CTAPlacementDBData {
  cta_id: string;
  blog_post_id?: string;
  placement_position: CTAPlacementPosition;
  position_config: Record<string, any>;
  priority: number;
  category_filter?: string[];
  tag_filter?: string[];
  active: boolean;
}

// CTA analytics data
export interface CTAAnalyticsData {
  cta_id: string;
  blog_post_id?: string;
  event_type: 'view' | 'click' | 'conversion';
  user_id?: string;
  session_id?: string;
  referrer?: string;
  user_agent?: string;
  device_type?: string;
  metadata?: Record<string, any>;
}

// CTA template types
export type CTATemplateType = 
  | 'newsletter_signup'
  | 'product_promotion'
  | 'content_download'
  | 'related_articles'
  | 'social_sharing'
  | 'contact_form'
  | 'free_trial';

export interface CTATemplateConfig {
  type: CTAType;
  action_type: CTAActionType;
  headline: string;
  description?: string;
  button_text: string;
  styling?: {
    background_color?: string;
    text_color?: string;
    button_color?: string;
    button_hover_color?: string;
    size?: string;
    border_radius?: string;
    icon_name?: string;
  };
  behavior?: {
    open_in_new_tab?: boolean;
    display_condition?: CTADisplayCondition;
  };
}