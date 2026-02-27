import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { FFRScoringEngine } from '@/utils/ffrScoring';
import type { FFRProgress, FFRFoundationsChecklist, FFRUserAction, FFRScore } from '@/types/ffr';
import type { CalculatorInputs, CalculationResults } from '@/types/calculator';

interface FFRFinancialData {
  inputs: CalculatorInputs | null;
  results: CalculationResults | null;
}

export const useFFR = (financialData?: FFRFinancialData) => {
  const { user } = useAuth();
  const [ffrProgress, setFFRProgress] = useState<FFRProgress | null>(null);
  const [checklist, setChecklist] = useState<FFRFoundationsChecklist | null>(null);
  const [actions, setActions] = useState<FFRUserAction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchFFRData();
    }
  }, [user]);

  const fetchFFRData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch FFR progress
      const { data: progressData } = await supabase
        .from('ffr_user_progress')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Fetch checklist
      const { data: checklistData } = await supabase
        .from('ffr_foundations_checklist')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Fetch user actions
      const { data: actionsData } = await supabase
        .from('ffr_user_actions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      setFFRProgress(progressData);
      setChecklist(checklistData);
      setActions((actionsData || []) as FFRUserAction[]);

      // If no progress exists, calculate initial scores
      if (!progressData && checklistData) {
        await calculateAndUpdateScores(checklistData, (actionsData || []) as FFRUserAction[]);
      }
    } catch (error) {
      console.error('Error fetching FFR data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Recalculate scores when financial data changes (SIP amount, required SIP, goal status)
  const prevHabitKeyRef = useRef<string>('');
  useEffect(() => {
    if (!user || !checklist || !financialData?.inputs || !financialData?.results) return;

    // Build a key from the values that affect habit score to avoid unnecessary recalcs
    const habitKey = [
      financialData.inputs.sipAmount,
      financialData.results.requiredMonthlySIP,
      financialData.results.canAchieveGoal,
      financialData.inputs.initialPortfolioValue > 0,
    ].join('|');

    if (habitKey === prevHabitKeyRef.current) return;
    prevHabitKeyRef.current = habitKey;

    calculateAndUpdateScores(checklist, actions);
  }, [
    financialData?.inputs?.sipAmount,
    financialData?.results?.requiredMonthlySIP,
    financialData?.results?.canAchieveGoal,
    financialData?.inputs?.initialPortfolioValue,
    checklist,
    user,
  ]);

  const calculateAndUpdateScores = async (
    currentChecklist: FFRFoundationsChecklist,
    currentActions: FFRUserAction[]
  ) => {
    if (!user) return;

    const foundationScore = FFRScoringEngine.calculateFoundationScore(currentChecklist);

    // Derive habit score from real financial data if available,
    // otherwise preserve existing stored score
    let habitScore: number;
    if (financialData?.inputs && financialData?.results) {
      const { sipReliability, savingConsistency } = FFRScoringEngine.deriveHabitMetrics(
        financialData.inputs,
        financialData.results
      );
      habitScore = FFRScoringEngine.calculateHabitScore(sipReliability, savingConsistency);
    } else {
      habitScore = ffrProgress?.habit_score ?? 0;
    }

    const literacyScore = FFRScoringEngine.calculateLiteracyScore(currentActions);
    const opportunityScore = FFRScoringEngine.calculateOpportunityScore(currentActions);
    const decumulationScore = FFRScoringEngine.calculateDecumulationScore(currentActions);

    const totalScores = FFRScoringEngine.calculateTotalScores(
      foundationScore,
      habitScore,
      literacyScore,
      opportunityScore,
      decumulationScore
    );

    const progressData = {
      user_id: user.id,
      foundation_score: foundationScore,
      habit_score: habitScore,
      literacy_score: literacyScore,
      opportunity_score: opportunityScore,
      decumulation_score: decumulationScore,
      total_score_conservative: totalScores.conservative,
      total_score_base: totalScores.base,
      total_score_optimistic: totalScores.optimistic,
      last_assessment_date: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('ffr_user_progress')
      .upsert(progressData, { onConflict: 'user_id' })
      .select()
      .single();

    if (!error && data) {
      setFFRProgress(data);
    }
  };

  const updateChecklistItem = async (
    field: keyof Omit<FFRFoundationsChecklist, 'id' | 'user_id' | 'last_updated' | 'created_at'>,
    value: boolean
  ) => {
    if (!user) return;

    const updatedChecklist = { ...checklist, [field]: value };

    const { data, error } = await supabase
      .from('ffr_foundations_checklist')
      .upsert({
        user_id: user.id,
        ...updatedChecklist,
        last_updated: new Date().toISOString()
      }, { onConflict: 'user_id' })
      .select()
      .single();

    if (!error && data) {
      setChecklist(data);
      
      // Record action
      await recordAction('checklist_completed', undefined, { field, value }, 2);
      
      // Recalculate scores
      await calculateAndUpdateScores(data, actions);
    }
  };

  const recordAction = async (
    actionType: string,
    contentId?: string,
    metadata: any = {},
    pointsEarned: number = 1
  ) => {
    if (!user) return;

    const actionData = {
      user_id: user.id,
      action_type: actionType,
      content_id: contentId,
      metadata,
      points_earned: pointsEarned,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('ffr_user_actions')
      .insert(actionData)
      .select()
      .single();

    if (!error && data) {
      setActions(prev => [data as FFRUserAction, ...prev]);
    }
  };

  const initializeUserData = async () => {
    if (!user) return;

    // Initialize checklist if doesn't exist
    const { data: existingChecklist } = await supabase
      .from('ffr_foundations_checklist')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!existingChecklist) {
      const { data: newChecklist } = await supabase
        .from('ffr_foundations_checklist')
        .insert({
          user_id: user.id,
          kyc_refresh: false,
          nomination_updated: false,
          emergency_fund_baseline: false,
          sip_mandate_active: false,
          document_vault_setup: false,
          insurance_evidence: false,
          freedom_gain_points: 0,
          last_updated: new Date().toISOString()
        })
        .select()
        .single();

      if (newChecklist) {
        setChecklist(newChecklist);
        await calculateAndUpdateScores(newChecklist, []);
      }
    }
  };

  const getCurrentScores = (): FFRScore | null => {
    if (!ffrProgress) return null;

    return {
      conservative: ffrProgress.total_score_conservative,
      base: ffrProgress.total_score_base,
      optimistic: ffrProgress.total_score_optimistic
    };
  };

  const getNextSteps = () => {
    if (!ffrProgress) return [];

    return FFRScoringEngine.calculateNextSteps(
      ffrProgress.foundation_score,
      ffrProgress.habit_score,
      ffrProgress.literacy_score,
      ffrProgress.opportunity_score,
      ffrProgress.decumulation_score
    );
  };

  return {
    ffrProgress,
    checklist,
    actions,
    loading,
    updateChecklistItem,
    recordAction,
    initializeUserData,
    getCurrentScores,
    getNextSteps,
    refetch: fetchFFRData
  };
};