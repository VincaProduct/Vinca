import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Sprint {
  id: string;
  user_id: string;
  score_component: 'corpus_progress' | 'time_buffer' | 'savings_rate' | 'essentials_coverage' | 'lifestyle_sustainability';
  sprint_type: 'monthly' | 'quarterly' | 'annual';
  status: 'active' | 'completed' | 'abandoned';
  sip_amount_committed: number | null;
  started_at: string;
  ends_at: string;
  completed_at: string | null;
  created_at: string;
}

export interface SprintReflection {
  id: string;
  sprint_id: string;
  user_id: string;
  phase: 'start' | 'midpoint' | 'completion';
  comfort_level: number | null;
  reflection_text: string | null;
  created_at: string;
}

const SPRINT_DURATION_DAYS: Record<Sprint['sprint_type'], number> = {
  monthly: 30,
  quarterly: 90,
  annual: 365,
};

export function useSprints() {
  const { user } = useAuth();

  async function getActiveSprint(): Promise<{ data: Sprint | null; error: any }> {
    if (!user) return { data: null, error: new Error('Not authenticated') };

    const { data, error } = await supabase
      .from('sprints')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle();

    return { data: data as Sprint | null, error };
  }

  async function startSprint(
    scoreComponent: Sprint['score_component'],
    sprintType: Sprint['sprint_type'],
    sipAmountCommitted?: number
  ): Promise<{ data: Sprint | null; error: any }> {
    if (!user) return { data: null, error: new Error('Not authenticated') };

    const now = new Date();
    const endsAt = new Date(now);
    endsAt.setDate(endsAt.getDate() + SPRINT_DURATION_DAYS[sprintType]);

    const { data, error } = await supabase
      .from('sprints')
      .insert({
        user_id: user.id,
        score_component: scoreComponent.trim().replace(/\.$/, '') as Sprint['score_component'],
        sprint_type: sprintType,
        status: 'active',
        sip_amount_committed: sipAmountCommitted ?? null,
        started_at: now.toISOString(),
        ends_at: endsAt.toISOString(),
      })
      .select()
      .single();

    return { data: data as Sprint | null, error };
  }

  async function completeSprint(sprintId: string): Promise<{ data: Sprint | null; error: any }> {
    if (!user) return { data: null, error: new Error('Not authenticated') };

    const { data, error } = await supabase
      .from('sprints')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', sprintId)
      .eq('user_id', user.id)
      .select()
      .single();

    return { data: data as Sprint | null, error };
  }

  async function abandonSprint(sprintId: string): Promise<{ data: Sprint | null; error: any }> {
    if (!user) return { data: null, error: new Error('Not authenticated') };

    const { data, error } = await supabase
      .from('sprints')
      .update({ status: 'abandoned' })
      .eq('id', sprintId)
      .eq('user_id', user.id)
      .select()
      .single();

    return { data: data as Sprint | null, error };
  }

  async function addReflection(
    sprintId: string,
    phase: SprintReflection['phase'],
    comfortLevel?: number,
    reflectionText?: string
  ): Promise<{ data: SprintReflection | null; error: any }> {
    if (!user) return { data: null, error: new Error('Not authenticated') };

    const { data, error } = await supabase
      .from('sprint_reflections')
      .insert({
        sprint_id: sprintId,
        user_id: user.id,
        phase,
        comfort_level: comfortLevel ?? null,
        reflection_text: reflectionText ?? null,
      })
      .select()
      .single();

    return { data: data as SprintReflection | null, error };
  }

  async function getReflections(sprintId: string): Promise<{ data: SprintReflection[]; error: any }> {
    if (!user) return { data: [], error: new Error('Not authenticated') };

    const { data, error } = await supabase
      .from('sprint_reflections')
      .select('*')
      .eq('sprint_id', sprintId)
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    return { data: (data ?? []) as SprintReflection[], error };
  }

  return {
    getActiveSprint,
    startSprint,
    completeSprint,
    abandonSprint,
    addReflection,
    getReflections,
  };
}
