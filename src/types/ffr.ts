export interface FFRScore {
  conservative: number;
  base: number;
  optimistic: number;
}

export interface FFRProgress {
  id?: string;
  user_id: string;
  foundation_score: number;
  habit_score: number;
  literacy_score: number;
  opportunity_score: number;
  decumulation_score: number;
  total_score_conservative: number;
  total_score_base: number;
  total_score_optimistic: number;
  last_assessment_date: string;
}

export interface FFRFoundationsChecklist {
  id?: string;
  user_id: string;
  kyc_refresh: boolean;
  nomination_updated: boolean;
  emergency_fund_baseline: boolean;
  sip_mandate_active: boolean;
  document_vault_setup: boolean;
  insurance_evidence: boolean;
  freedom_gain_points: number;
  last_updated: string;
}

export interface FFREducationalContent {
  id: string;
  title: string;
  content_type: 'video' | 'article' | 'document' | 'explainer';
  category: string;
  duration_seconds?: number;
  content_url?: string;
  description: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  points_value: number;
  is_active: boolean;
}

export interface FFROpportunity {
  id: string;
  lane: string;
  opportunity_name: string;
  trigger_conditions: any; // Changed for JSON compatibility
  educational_content: string;
  why_matters: string;
  partner_handoff_url?: string;
  eligibility_criteria: any; // Changed for JSON compatibility
  seasonal_window?: any; // Changed for JSON compatibility
  is_active: boolean;
}

export interface FFRUserAction {
  id?: string;
  user_id: string;
  action_type: string; // Changed from union type to string for flexibility
  content_id?: string;
  metadata: any; // Changed from Record<string, any> to any for JSON compatibility
  points_earned: number;
  created_at: string;
}

export interface FFRNextStep {
  title: string;
  description: string;
  type: 'education' | 'checklist' | 'opportunity';
  action_url?: string;
  priority: number;
}