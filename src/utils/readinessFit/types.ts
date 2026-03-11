/**
 * Readiness Fit - Type Definitions
 * Core interfaces for financial and lifestyle readiness calculations
 */

/**
 * Financial inputs required for readiness scoring
 */
export interface FinancialInputs {
  /** Total liquid savings in rupees */
  currentSavings: number;
  /** Monthly systematic investment plan amount */
  monthlySIP: number;
  /** Number of months of essential expenses covered by emergency fund */
  emergencyFundMonths: number;
  /** Current retirement savings corpus */
  currentRetirementCorpus: number;
  /** Target retirement corpus needed */
  targetRetirementCorpus: number;
  /** Post-tax monthly income */
  monthlyIncome: number;
  /** Non-negotiable monthly essential expenses */
  monthlyEssentialExpenses: number;
  /** How long SIP has been running continuously (in months) */
  sipConsistencyMonths: number;
}

/**
 * Lifestyle inputs required for readiness scoring
 */
export interface LifestyleInputs {
  /** Desired retirement age */
  desiredRetirementAge: number;
  /** Current age */
  currentAge: number;
  /** Inflation-adjusted dream monthly lifestyle cost at retirement */
  desiredMonthlyLifestyleCost: number;
  /** Projected passive income at retirement */
  projectedPassiveIncome: number;
  /** Annual inflation rate (default: 0.06) */
  inflationRate?: number;
  /** Life expectancy assumption (default: 85) */
  lifeExpectancy?: number;
  /** Whether user has dependents */
  hasDependents: boolean;
  /** Whether dependent education is planned for */
  dependentsEducationPlanned: boolean;
}

/**
 * Financial readiness calculation output
 */
export interface FinancialReadinessResult {
  /** Financial score (0-100) */
  score: number;
  /** Detailed metrics */
  metrics: {
    savingsAdequacyRatio: number;
    emergencyFundCoverage: number;
    sipConsistencyScore: number;
    retirementCorpusCompletion: number;
    incomeStabilityIndex: number;
  };
  /** Identified gaps with severity */
  gaps: Array<{
    type: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
  }>;
}

/**
 * Lifestyle readiness calculation output
 */
export interface LifestyleReadinessResult {
  /** Lifestyle score (0-100) */
  score: number;
  /** Detailed metrics */
  metrics: {
    yearsToRetirement: number;
    inflationAdjustedLifestyleCost: number;
    sustainabilityRatio: number;
    longevityRiskYears: number;
  };
  /** Identified mismatches */
  mismatches: Array<{
    category: string;
    description: string;
    gap: number;
    severity: 'low' | 'medium' | 'high';
  }>;
}

/**
 * Combined readiness fit result
 */
export interface ReadinessFitResult {
  /** Overall readiness fit score (0-100) */
  score: number;
  /** Financial readiness component */
  financial: FinancialReadinessResult;
  /** Lifestyle readiness component */
  lifestyle: LifestyleReadinessResult;
  /** Insight generation */
  insights: ReadinessInsights;
  /** Whether calculation is incomplete */
  isIncomplete: boolean;
  /** Missing required inputs */
  missingInputs?: string[];
}

/**
 * Premium insights and recommendations
 */
export interface ReadinessInsights {
  /** One plain English headline about readiness status */
  headline: string;
  /** Main blockers preventing better readiness (2-3 items) */
  blockers: Array<{
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
  }>;
  /** Positive reinforcement message for confidence building */
  positiveReinforcement: string;
  /** Optional: single recommended next step */
  nextBestAction?: string;
}

/**
 * User tier for access control
 */
export type UserTier = 'free' | 'premium' | 'legacy';

/**
 * Readiness Fit component props
 */
export interface ReadinessFitProps {
  /** Current user tier */
  userTier: UserTier;
  /** Whether user has completed financial readiness assessment */
  hasCompletedFinancialReadiness: boolean;
  /** Whether user has completed lifestyle planner */
  hasCompletedLifestylePlanner: boolean;
  /** Financial data (optional for free tier) */
  financialInputs?: FinancialInputs | null;
  /** Lifestyle data (optional for free tier) */
  lifestyleInputs?: LifestyleInputs | null;
  /** Callback when user initiates upgrade */
  onUpgradeClick?: () => void;
  /** Callback when detailed view is opened */
  onDetailedViewOpen?: (result: ReadinessFitResult) => void;
}
