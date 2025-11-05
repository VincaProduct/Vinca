-- Add new placement positions for simplified CTA system
ALTER TYPE cta_placement_position ADD VALUE IF NOT EXISTS 'below_toc';
ALTER TYPE cta_placement_position ADD VALUE IF NOT EXISTS 'inline_marker';