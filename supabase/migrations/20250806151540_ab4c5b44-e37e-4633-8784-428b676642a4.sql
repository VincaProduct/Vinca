-- Insert default CTA templates
INSERT INTO public.cta_templates (name, template_type, template_config) VALUES
('Blue Newsletter Button', 'newsletter_signup', '{
  "type": "button",
  "action_type": "email_signup",
  "headline": "Stay Updated",
  "description": "Get the latest insights delivered to your inbox",
  "button_text": "Subscribe Now",
  "styling": {
    "background_color": "#3b82f6",
    "text_color": "#ffffff",
    "button_color": "#1d4ed8",
    "button_hover_color": "#1e40af",
    "size": "medium",
    "border_radius": "md",
    "icon_name": "mail"
  }
}'),
('Green CTA Card', 'product_promotion', '{
  "type": "card",
  "action_type": "navigate_url",
  "headline": "Special Offer",
  "description": "Limited time promotion for premium users",
  "button_text": "Get Started",
  "styling": {
    "background_color": "#10b981",
    "text_color": "#ffffff",
    "button_color": "#059669",
    "button_hover_color": "#047857",
    "size": "large",
    "border_radius": "lg",
    "icon_name": "arrow-right"
  }
}'),
('Minimal Download Banner', 'content_download', '{
  "type": "banner",
  "action_type": "download_file",
  "headline": "Free Resource",
  "description": "Download our comprehensive guide",
  "button_text": "Download PDF",
  "styling": {
    "background_color": "#f3f4f6",
    "text_color": "#374151",
    "button_color": "#6b7280",
    "button_hover_color": "#4b5563",
    "size": "medium",
    "border_radius": "sm",
    "icon_name": "download"
  }
}'),
('Purple Inline CTA', 'related_articles', '{
  "type": "inline_text",
  "action_type": "navigate_url",
  "headline": "Read More",
  "description": "Explore related content",
  "button_text": "View Articles",
  "styling": {
    "background_color": "#8b5cf6",
    "text_color": "#ffffff",
    "button_color": "#7c3aed",
    "button_hover_color": "#6d28d9",
    "size": "small",
    "border_radius": "full",
    "icon_name": "chevron-right"
  }
}');