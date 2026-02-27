import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { CalculatorInputs, CalculationResults } from '@/types/calculator';
import {
  FinancialPlanningContextType,
  FinancialPlanningState,
  DetailedProjection,
  LifestyleData,
  HealthStressData,
  HealthCategory,
  LifestyleTier,
  HEALTH_COSTS
} from '@/types/financial-planning';
import { calculateFinancialFreedom } from '@/utils/calculatorUtils';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

// Re-export FV and CEILING functions for projection calculations
export function FV(
  rate: number,
  nper: number,
  pmt: number,
  pv: number = 0,
  type: number = 0
): number {
  if (rate === 0) {
    return -(pv + pmt * nper);
  }
  const pvFactor = Math.pow(1 + rate, nper);
  const pmtFactor = ((Math.pow(1 + rate, nper) - 1) / rate) * (1 + rate * type);
  return -(pv * pvFactor + pmt * pmtFactor);
}

export function CEILING(number: number, significance: number): number {
  if (significance === 0) return 0;
  if (number === 0) return 0;
  if (number < 0 && significance > 0) {
    return -Math.floor(Math.abs(number) / significance) * significance;
  }
  if (number > 0 && significance < 0) return NaN;
  if (number < 0 && significance < 0) {
    return -Math.ceil(Math.abs(number) / Math.abs(significance)) * Math.abs(significance);
  }
  return Math.ceil(number / significance) * significance;
}

const STORAGE_KEY = 'financial_planning_state';

const defaultInputs: CalculatorInputs = {
  age: 30,
  lifeExpectancy: 85,
  initialPortfolioValue: 500000,
  sipAmount: 25000,
  yearsForSIP: 25,
  returnDuringSIPAndWaiting: 12,
  growthInSIP: 10,
  waitingYearsBeforeSWP: 5,
  currentMonthlyExpenses: 50000,
  monthlyIncome: 100000,
  inflation: 7,
  returnDuringSWP: 10,
  growthInSWP: 7,
};

const initialState: FinancialPlanningState = {
  inputs: null,
  results: null,
  projections: [],
  lifestyleShift: 0,
  lifestyleData: null,
  healthCategory: 'everyday',
  healthStressData: null,
  isLoading: true,
  hasCalculated: false,
  activeTab: 'readiness',
};

const FinancialPlanningContext = createContext<FinancialPlanningContextType | null>(null);

export function FinancialPlanningProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [state, setState] = useState<FinancialPlanningState>(initialState);

  // Generate detailed projections from inputs
  const generateDetailedProjections = useCallback((inputs: CalculatorInputs): DetailedProjection[] => {
    if (!inputs) return [];

    const projections: DetailedProjection[] = [];
    let currentCorpus = inputs.initialPortfolioValue;
    const annualReturn = inputs.returnDuringSIPAndWaiting / 100;
    const swpReturn = inputs.returnDuringSWP / 100;
    const currentAge = inputs.age;
    const sipEndYear = inputs.yearsForSIP;
    const swpStartYear = inputs.yearsForSIP + inputs.waitingYearsBeforeSWP;

    const inflatedMonthlyExpenses = CEILING(
      inputs.currentMonthlyExpenses * Math.pow(1 + inputs.inflation / 100, swpStartYear),
      1000
    );

    let previousMonthlySWP = 0;

    for (let year = 1; year <= inputs.lifeExpectancy - currentAge; year++) {
      const age = currentAge + year;
      const yearNumber = year;

      const isInSIPPhase = year <= sipEndYear;
      const isInWaitingPhase = year > sipEndYear && year <= swpStartYear;
      const isInSWPPhase = year > swpStartYear;

      let monthlySIP = 0;
      if (isInSIPPhase) {
        const sipGrowthRate = inputs.growthInSIP / 100;
        monthlySIP = inputs.sipAmount * Math.pow(1 + sipGrowthRate, year - 1);
      }

      const returnRate = isInSWPPhase ? swpReturn : annualReturn;

      let monthlySWP = 0;
      if (isInSWPPhase) {
        if (inputs.yearsForSIP + inputs.waitingYearsBeforeSWP + 1 === year) {
          monthlySWP = inflatedMonthlyExpenses;
        } else {
          monthlySWP = previousMonthlySWP * (1 + inputs.growthInSWP / 100);
        }
        previousMonthlySWP = monthlySWP;
      }

      let beginningCorpus = currentCorpus;

      if (isInSIPPhase || isInWaitingPhase) {
        const rate = Math.pow(1 + annualReturn, 1 / 12) - 1;
        beginningCorpus = FV(rate, 12, -monthlySIP, -beginningCorpus, 1);
      } else {
        const rate = Math.pow(1 + swpReturn, 1 / 12) - 1;
        beginningCorpus = FV(rate, 12, monthlySWP, -beginningCorpus, 1);
      }

      const expectedCorpus = beginningCorpus;

      projections.push({
        year: currentAge + year,
        yearNumber,
        age,
        amountInHand: currentCorpus,
        lumpsumInvestment: 0,
        monthlySIP,
        returnRate: returnRate * 100,
        monthlySWP,
        lumpsumWithdrawal: 0,
        expectedCorpus,
        isInSIPPhase,
        isInWaitingPhase,
        isInSWPPhase,
      });

      currentCorpus = expectedCorpus;
    }

    return projections;
  }, []);

  // Calculate lifestyle data based on shift
  const calculateLifestyleData = useCallback((
    inputs: CalculatorInputs,
    projections: DetailedProjection[],
    lifestyleShift: number
  ): LifestyleData | null => {
    if (!inputs || projections.length === 0) return null;

    const yearsToRetirement = inputs.yearsForSIP + inputs.waitingYearsBeforeSWP;
    const adjustedMonthlyExpenses = inputs.currentMonthlyExpenses * (1 + lifestyleShift / 100);
    const expensesAtRetirement = adjustedMonthlyExpenses * Math.pow(1 + inputs.inflation / 100, yearsToRetirement);
    const requiredCorpus = (expensesAtRetirement * 12) / 0.04; // 4% safe withdrawal rule

    // Get expected corpus at retirement from projections
    const retirementProjection = projections.find(p => p.age === inputs.age + yearsToRetirement);
    const expectedCorpus = retirementProjection?.expectedCorpus || 0;
    const corpusGap = requiredCorpus - expectedCorpus;

    // Determine tier
    let tier: LifestyleTier;
    if (lifestyleShift <= 0) {
      tier = 'Essentials';
    } else if (lifestyleShift <= 50) {
      tier = 'Comfortable';
    } else {
      tier = 'Premium';
    }

    // Calculate sustainability using monthly FV (consistent with Tab 1 projection engine)
    const retirementYears = inputs.lifeExpectancy - (inputs.age + yearsToRetirement);
    let sustainabilityYears = 0;
    let corpus = expectedCorpus;
    const swpReturn = inputs.returnDuringSWP / 100;
    const monthlyRate = Math.pow(1 + swpReturn, 1 / 12) - 1;
    let monthlySWP = CEILING(expensesAtRetirement, 1000);

    for (let year = 0; year < retirementYears; year++) {
      corpus = FV(monthlyRate, 12, monthlySWP, -corpus, 1);
      if (corpus > 0) {
        sustainabilityYears++;
      } else {
        break;
      }
      monthlySWP *= (1 + inputs.growthInSWP / 100);
    }

    return {
      lifestyleShift,
      adjustedMonthlyExpenses,
      expensesAtRetirement,
      requiredCorpus,
      expectedCorpus,
      corpusGap,
      tier,
      sustainabilityYears,
      isSustainable: sustainabilityYears >= retirementYears,
    };
  }, []);

  // Calculate health stress data
  const calculateHealthStressData = useCallback((
    inputs: CalculatorInputs,
    projections: DetailedProjection[],
    category: HealthCategory
  ): HealthStressData | null => {
    if (!inputs || projections.length === 0) return null;

    const healthCost = HEALTH_COSTS[category];
    const healthAdjustedExpenses = inputs.currentMonthlyExpenses + healthCost.monthly;

    // Get corpus at retirement from existing projections
    // (accumulation phase is unaffected by expense changes — expenses only affect SWP withdrawals)
    const yearsToRetirement = inputs.yearsForSIP + inputs.waitingYearsBeforeSWP;
    const originalRetirementCorpus = projections.find(p => p.age === inputs.age + yearsToRetirement)?.expectedCorpus || 0;

    // Deduct one-time costs from corpus
    const healthAdjustedCorpus = originalRetirementCorpus - healthCost.oneTime;
    const corpusImpact = healthCost.oneTime;

    // Calculate sustainability with health costs using monthly FV (consistent with Tab 1)
    const retirementAge = inputs.age + yearsToRetirement;
    const retirementYears = inputs.lifeExpectancy - retirementAge;
    let sustainabilityYears = 0;
    let corpus = healthAdjustedCorpus;
    const swpReturn = inputs.returnDuringSWP / 100;
    const monthlyRate = Math.pow(1 + swpReturn, 1 / 12) - 1;
    let monthlySWP = CEILING(
      healthAdjustedExpenses * Math.pow(1 + inputs.inflation / 100, yearsToRetirement),
      1000
    );

    for (let year = 0; year < retirementYears; year++) {
      corpus = FV(monthlyRate, 12, monthlySWP, -corpus, 1);
      if (corpus > 0) {
        sustainabilityYears++;
      } else {
        break;
      }
      monthlySWP *= (1 + inputs.growthInSWP / 100);
    }

    // Calculate original sustainability using monthly FV
    let originalSustainabilityYears = 0;
    corpus = originalRetirementCorpus;
    let originalMonthlySWP = CEILING(
      inputs.currentMonthlyExpenses * Math.pow(1 + inputs.inflation / 100, yearsToRetirement),
      1000
    );

    for (let year = 0; year < retirementYears; year++) {
      corpus = FV(monthlyRate, 12, originalMonthlySWP, -corpus, 1);
      if (corpus > 0) {
        originalSustainabilityYears++;
      } else {
        break;
      }
      originalMonthlySWP *= (1 + inputs.growthInSWP / 100);
    }

    return {
      category,
      healthAdjustedExpenses,
      healthAdjustedCorpus,
      corpusImpact,
      sustainabilityYears,
      sustainableTillAge: retirementAge + sustainabilityYears,
      originalSustainableTillAge: retirementAge + originalSustainabilityYears,
      yearsLost: originalSustainabilityYears - sustainabilityYears,
    };
  }, []);

  // Set inputs, calculate, and persist
  const setInputs = useCallback(async (newInputs: CalculatorInputs) => {
    const results = calculateFinancialFreedom(newInputs);
    const projections = generateDetailedProjections(newInputs);

    setState(prev => ({
      ...prev,
      inputs: newInputs,
      results,
      projections,
      hasCalculated: true,
      lifestyleData: calculateLifestyleData(newInputs, projections, prev.lifestyleShift),
      healthStressData: calculateHealthStressData(newInputs, projections, prev.healthCategory),
    }));

    // Persist immediately with the fresh computed data (avoids stale closure)
    localStorage.setItem('financial_calculator_inputs', JSON.stringify(newInputs));
    localStorage.setItem('financial_calculator_results', JSON.stringify(results));

    if (user) {
      try {
        await supabase.from('user_calculations').upsert({
          user_id: user.id,
          calculation_type: 'financial_freedom',
          inputs: newInputs as unknown as Record<string, unknown>,
          results: results as unknown as Record<string, unknown>,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id,calculation_type' });
      } catch (error) {
        console.error('Error saving to database:', error);
      }
    }
  }, [user, generateDetailedProjections, calculateLifestyleData, calculateHealthStressData]);

  // Calculate results from current inputs
  const calculateResults = useCallback(() => {
    if (!state.inputs) return;

    const results = calculateFinancialFreedom(state.inputs);
    const projections = generateDetailedProjections(state.inputs);

    setState(prev => ({
      ...prev,
      results,
      projections,
      hasCalculated: true,
      lifestyleData: calculateLifestyleData(prev.inputs!, projections, prev.lifestyleShift),
      healthStressData: calculateHealthStressData(prev.inputs!, projections, prev.healthCategory),
    }));
  }, [state.inputs, generateDetailedProjections, calculateLifestyleData, calculateHealthStressData]);

  // Set lifestyle shift
  const setLifestyleShift = useCallback((shift: number) => {
    setState(prev => ({
      ...prev,
      lifestyleShift: shift,
      lifestyleData: prev.inputs && prev.projections.length > 0
        ? calculateLifestyleData(prev.inputs, prev.projections, shift)
        : null,
    }));
  }, [calculateLifestyleData]);

  // Set health category
  const setHealthCategory = useCallback((category: HealthCategory) => {
    setState(prev => ({
      ...prev,
      healthCategory: category,
      healthStressData: prev.inputs && prev.projections.length > 0
        ? calculateHealthStressData(prev.inputs, prev.projections, category)
        : null,
    }));
  }, [calculateHealthStressData]);

  // Set active tab
  const setActiveTab = useCallback((tab: string) => {
    setState(prev => ({ ...prev, activeTab: tab }));
  }, []);

  // Reset state
  const resetState = useCallback(() => {
    setState({ ...initialState, isLoading: false });
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Load from storage
  const loadFromStorage = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      // Try to load from DB first if user is logged in
      if (user) {
        const { data, error } = await supabase
          .from('user_calculations')
          .select('inputs, results')
          .eq('user_id', user.id)
          .eq('calculation_type', 'financial_freedom')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (!error && data) {
          const inputs = {
            ...defaultInputs,
            ...data.inputs
          } as CalculatorInputs;
          // Always recalculate from inputs so formula updates take effect immediately
          const results = calculateFinancialFreedom(inputs);
          const projections = generateDetailedProjections(inputs);

          setState(prev => ({
            ...prev,
            inputs,
            results,
            projections,
            hasCalculated: true,
            isLoading: false,
            lifestyleData: calculateLifestyleData(inputs, projections, prev.lifestyleShift),
            healthStressData: calculateHealthStressData(inputs, projections, prev.healthCategory),
          }));
          return;
        }
      }

      // Fallback to localStorage
      const storedInputs = localStorage.getItem('financial_calculator_inputs');

      if (storedInputs) {
        const parsed = JSON.parse(storedInputs) as CalculatorInputs;
        const inputs = {
          ...defaultInputs,
          ...parsed
        } as CalculatorInputs;
        const results = calculateFinancialFreedom(inputs);
        const projections = generateDetailedProjections(inputs);

        setState(prev => ({
          ...prev,
          inputs,
          results,
          projections,
          hasCalculated: true,
          isLoading: false,
          lifestyleData: calculateLifestyleData(inputs, projections, prev.lifestyleShift),
          healthStressData: calculateHealthStressData(inputs, projections, prev.healthCategory),
        }));
        return;
      }

      // No stored data, use defaults
      setState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      console.error('Error loading financial planning data:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [user, generateDetailedProjections, calculateLifestyleData, calculateHealthStressData]);

  // Load data on mount
  useEffect(() => {
    loadFromStorage();
  }, [user]);

  // Recalculate lifestyle and health data when inputs change
  useEffect(() => {
    if (state.inputs && state.projections.length > 0) {
      setState(prev => ({
        ...prev,
        lifestyleData: calculateLifestyleData(prev.inputs!, prev.projections, prev.lifestyleShift),
        healthStressData: calculateHealthStressData(prev.inputs!, prev.projections, prev.healthCategory),
      }));
    }
  }, [state.inputs, state.projections, calculateLifestyleData, calculateHealthStressData]);

  const contextValue = useMemo(() => ({
    ...state,
    setInputs,
    calculateResults,
    setLifestyleShift,
    setHealthCategory,
    setActiveTab,
    resetState,
    loadFromStorage,
  }), [state, setInputs, calculateResults, setLifestyleShift, setHealthCategory, setActiveTab, resetState, loadFromStorage]);

  return (
    <FinancialPlanningContext.Provider value={contextValue}>
      {children}
    </FinancialPlanningContext.Provider>
  );
}

export function useFinancialPlanning() {
  const context = useContext(FinancialPlanningContext);
  if (!context) {
    throw new Error('useFinancialPlanning must be used within a FinancialPlanningProvider');
  }
  return context;
}

export { defaultInputs };
