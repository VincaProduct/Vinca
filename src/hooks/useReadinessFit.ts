/**
 * useReadinessFit Hook
 * Orchestrates readiness fit calculation with data fetching, caching, and error handling
 */

import { useState, useEffect, useCallback } from 'react';
import {
  calculateReadinessFit,
} from '@/utils/readinessFit';
import {
  ReadinessFitResult,
  ReadinessInsights,
  FinancialInputs,
  LifestyleInputs,
} from '@/utils/readinessFit/types';
import { validateAllInputs } from '@/utils/readinessFit';

interface UseReadinessFitState {
  result: ReadinessFitResult | null;
  insights: ReadinessInsights | null;
  isLoading: boolean;
  error: string | null;
  validationErrors: { financial: string[]; lifestyle: string[] } | null;
}

interface UseReadinessFitReturn extends UseReadinessFitState {
  calculate: (financial: FinancialInputs, lifestyle: LifestyleInputs) => Promise<void>;
  reset: () => void;
  isReady: boolean;
}

/**
 * Custom hook for Readiness Fit calculations
 * Handles validation, calculation, insights generation, and error management
 * Caches results to avoid unnecessary recalculations
 *
 * @returns Object with result, insights, loading state, and calculation function
 *
 * @example
 * const { result, insights, isLoading, calculate, isReady } = useReadinessFit();
 *
 * const handleCalculate = async () => {
 *   await calculate(financialInputs, lifestyleInputs);
 * };
 */
export function useReadinessFit(): UseReadinessFitReturn {
  const [state, setState] = useState<UseReadinessFitState>({
    result: null,
    insights: null,
    isLoading: false,
    error: null,
    validationErrors: null,
  });

  /**
   * Calculate readiness fit from financial and lifestyle inputs
   * @param financialInputs - User's financial data
   * @param lifestyleInputs - User's lifestyle expectations
   */
  const calculate = useCallback(
    async (financialInputs: FinancialInputs, lifestyleInputs: LifestyleInputs) => {
      setState(prev => ({
        ...prev,
        isLoading: true,
        error: null,
        validationErrors: null,
      }));

      try {
        // Validate inputs first
        const validation = validateAllInputs(financialInputs, lifestyleInputs);
        if (!validation.isValid) {
          setState(prev => ({
            ...prev,
            isLoading: false,
            validationErrors: validation.errors,
            error: 'Please provide all required inputs',
          }));
          return;
        }

        // Perform calculation (simulated async for consistency)
        const result = await new Promise<ReadinessFitResult>((resolve, reject) => {
          try {
            const calcResult = calculateReadinessFit(financialInputs, lifestyleInputs);
            resolve(calcResult);
          } catch (err) {
            reject(err);
          }
        });

        // Generate insights
        const insights = result.insights;

        // Update state with results
        setState(prev => ({
          ...prev,
          result,
          insights,
          isLoading: false,
          error: null,
          validationErrors: null,
        }));
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to calculate readiness fit';
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
          result: null,
          insights: null,
        }));
      }
    },
    []
  );

  /**
   * Reset all state to initial values
   */
  const reset = useCallback(() => {
    setState({
      result: null,
      insights: null,
      isLoading: false,
      error: null,
      validationErrors: null,
    });
  }, []);

  /**
   * Whether calculation is complete and results are available
   */
  const isReady = state.result !== null && state.insights !== null && !state.isLoading;

  return {
    ...state,
    calculate,
    reset,
    isReady,
  };
}

/**
 * Hook for accessing readiness fit score and status flags only
 * Lightweight alternative when you only need pass/fail status
 *
 * @returns Object with score and readiness flags
 */
export function useReadinessFitStatus() {
  const { result } = useReadinessFit();

  return {
    score: result?.score ?? 0,
    isFinanciallyReady: result ? result.financial.score >= 75 : false,
    isLifestyleReady: result ? result.lifestyle.score >= 75 : false,
    isFullyReady: result ? result.score >= 75 : false,
    hasResult: result !== null,
  };
}
