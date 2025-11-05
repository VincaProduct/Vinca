-- Create FFR tables for Financial Freedom Readiness module

-- FFR user progress tracking
CREATE TABLE public.ffr_user_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  foundation_score INTEGER DEFAULT 0,
  habit_score INTEGER DEFAULT 0,
  literacy_score INTEGER DEFAULT 0,
  opportunity_score INTEGER DEFAULT 0,
  decumulation_score INTEGER DEFAULT 0,
  total_score_conservative INTEGER DEFAULT 0,
  total_score_base INTEGER DEFAULT 0,
  total_score_optimistic INTEGER DEFAULT 0,
  last_assessment_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- FFR educational content management
CREATE TABLE public.ffr_educational_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content_type TEXT NOT NULL, -- 'video', 'article', 'document', 'explainer'
  category TEXT NOT NULL, -- 'mf_education', 'tax_season', 'fd_ladder', 'aif_pms', 'mld_ncd', 'unlisted', 'decumulation'
  duration_seconds INTEGER, -- for videos/explainers
  content_url TEXT,
  description TEXT,
  difficulty_level TEXT DEFAULT 'beginner', -- 'beginner', 'intermediate', 'advanced'
  points_value INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- FFR opportunities tracking
CREATE TABLE public.ffr_opportunities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lane TEXT NOT NULL, -- 'mf_education', 'tax_season', 'fd_ladder', etc.
  opportunity_name TEXT NOT NULL,
  trigger_conditions JSONB, -- factual conditions that make this relevant
  educational_content TEXT,
  why_matters TEXT, -- why it matters for financial freedom
  partner_handoff_url TEXT,
  eligibility_criteria JSONB,
  seasonal_window JSONB, -- for time-sensitive opportunities
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- FFR user actions and engagement tracking
CREATE TABLE public.ffr_user_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  action_type TEXT NOT NULL, -- 'education_opened', 'document_viewed', 'handoff_clicked', 'checklist_completed'
  content_id UUID, -- reference to educational content or opportunity
  metadata JSONB DEFAULT '{}',
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- FFR foundations checklist
CREATE TABLE public.ffr_foundations_checklist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  kyc_refresh BOOLEAN DEFAULT false,
  nomination_updated BOOLEAN DEFAULT false,
  emergency_fund_baseline BOOLEAN DEFAULT false,
  sip_mandate_active BOOLEAN DEFAULT false,
  document_vault_setup BOOLEAN DEFAULT false,
  insurance_evidence BOOLEAN DEFAULT false,
  freedom_gain_points INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.ffr_user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ffr_educational_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ffr_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ffr_user_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ffr_foundations_checklist ENABLE ROW LEVEL SECURITY;

-- RLS policies for ffr_user_progress
CREATE POLICY "Users can view their own FFR progress" 
ON public.ffr_user_progress 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own FFR progress" 
ON public.ffr_user_progress 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own FFR progress" 
ON public.ffr_user_progress 
FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS policies for educational content (public read)
CREATE POLICY "Anyone can view active educational content" 
ON public.ffr_educational_content 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Super admins can manage educational content" 
ON public.ffr_educational_content 
FOR ALL 
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- RLS policies for opportunities (public read)
CREATE POLICY "Anyone can view active opportunities" 
ON public.ffr_opportunities 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Super admins can manage opportunities" 
ON public.ffr_opportunities 
FOR ALL 
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- RLS policies for user actions
CREATE POLICY "Users can view their own actions" 
ON public.ffr_user_actions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own actions" 
ON public.ffr_user_actions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- RLS policies for foundations checklist
CREATE POLICY "Users can view their own checklist" 
ON public.ffr_foundations_checklist 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own checklist" 
ON public.ffr_foundations_checklist 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own checklist" 
ON public.ffr_foundations_checklist 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Add triggers for updated_at
CREATE TRIGGER update_ffr_user_progress_updated_at
BEFORE UPDATE ON public.ffr_user_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ffr_educational_content_updated_at
BEFORE UPDATE ON public.ffr_educational_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ffr_opportunities_updated_at
BEFORE UPDATE ON public.ffr_opportunities
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample educational content
INSERT INTO public.ffr_educational_content (title, content_type, category, duration_seconds, description, points_value) VALUES
('Understanding Mutual Funds', 'explainer', 'mf_education', 60, 'Learn the basics of mutual fund investing', 2),
('Tax Saving Strategies', 'explainer', 'tax_season', 60, 'Explore tax-efficient investment options', 2),
('Fixed Deposit Laddering', 'explainer', 'fd_ladder', 60, 'Build a systematic FD investment approach', 2),
('AIF & PMS Eligibility', 'explainer', 'aif_pms', 60, 'Understand alternative investment eligibility', 3),
('Systematic Withdrawal Plans', 'explainer', 'decumulation', 60, 'Learn about SWP for retirement income', 3),
('Bucket Strategy for Retirement', 'explainer', 'decumulation', 60, 'Understand bucket approach to retirement planning', 3),
('Annuity Basics', 'explainer', 'decumulation', 60, 'Explore annuity products for guaranteed income', 2),
('Longevity Planning', 'explainer', 'decumulation', 60, 'Plan for extended life expectancy', 3);

-- Insert sample opportunities
INSERT INTO public.ffr_opportunities (lane, opportunity_name, trigger_conditions, educational_content, why_matters, eligibility_criteria) VALUES
('mf_education', 'Equity Fund Education', '{"age_below": 40, "risk_tolerance": "moderate"}', 'Learn about equity mutual funds for long-term wealth creation', 'Equity funds can help build wealth over time through market participation', '{"min_age": 18, "risk_profile": ["moderate", "aggressive"]}'),
('tax_season', 'ELSS Tax Planning', '{"month": [1,2,3], "tax_regime": "old"}', 'Explore Equity Linked Savings Schemes for tax benefits', 'ELSS funds provide tax deduction under Section 80C while building wealth', '{"tax_regime": "old", "income_above": 250000}'),
('fd_ladder', 'FD Ladder Strategy', '{"fd_allocation": {"gt": 50}}', 'Learn systematic FD investment approach', 'FD laddering can provide regular income while managing interest rate risk', '{"age_above": 45}'),
('aif_pms', 'Alternative Investment Education', '{"net_worth": {"gte": 2500000}}', 'Understand AIF and PMS investment options', 'Alternative investments can provide diversification for qualified investors', '{"net_worth_min": 2500000, "accredited_investor": true}');