import { CalculatorInputs, CalculationResults } from './calculator';

// Lifestyle tiers for the Lifestyle Planner
export type LifestyleTier = 'Essentials' | 'Comfortable' | 'Premium';

// Health stress categories
export type HealthCategory = 'everyday' | 'planned' | 'highImpact';

// Health cost model for each category
export interface HealthCostModel {
  monthly: number;      // Monthly additional expense in INR
  oneTime: number;      // One-time expense in INR
  label: string;        // Display label
  description: string;  // Description of the scenario
  icon: string;         // Icon/emoji for display
}

// Health costs configuration
export const HEALTH_COSTS: Record<HealthCategory, HealthCostModel> = {
  everyday: {
    monthly: 1200,
    oneTime: 0,
    label: 'Everyday Wellness',
    description: 'Regular health maintenance including medications, supplements, and routine checkups',
    icon: '🏥'
  },
  planned: {
    monthly: 600,
    oneTime: 80000,
    label: 'Planned Procedures',
    description: 'Anticipated medical procedures like dental work, vision correction, or minor surgeries',
    icon: '📋'
  },
  highImpact: {
    monthly: 2000,
    oneTime: 240000,
    label: 'High-Impact Event',
    description: 'Major health events requiring hospitalization, surgery, or extended treatment',
    icon: '🚑'
  }
};

// Lifestyle planner data
export interface LifestyleData {
  lifestyleShift: number;           // Percentage shift from -50 to +100
  adjustedMonthlyExpenses: number;  // Current expenses * (1 + shift/100)
  expensesAtRetirement: number;     // Inflation-adjusted to retirement
  requiredCorpus: number;           // Required corpus for 4% rule
  expectedCorpus: number;           // Expected corpus from Financial Readiness
  corpusGap: number;                // Gap between required and expected
  tier: LifestyleTier;              // Current tier classification
  sustainabilityYears: number;      // Years the corpus can sustain
  isSustainable: boolean;           // Whether corpus lasts through life expectancy
}

// Health stress analysis data
export interface HealthStressData {
  category: HealthCategory;
  healthAdjustedExpenses: number;   // Monthly expenses + health costs
  healthAdjustedCorpus: number;     // Corpus after health cost impact
  corpusImpact: number;             // Reduction in final corpus
  sustainabilityYears: number;      // Years sustainable with health costs
  sustainableTillAge: number;       // Age until corpus lasts
  originalSustainableTillAge: number; // Without health costs
  yearsLost: number;                // Years of sustainability lost
}

// Projection data for charts and tables
export interface DetailedProjection {
  year: number;
  yearNumber: number;
  age: number;
  amountInHand: number;
  lumpsumInvestment: number;
  monthlySIP: number;
  returnRate: number;
  monthlySWP: number;
  lumpsumWithdrawal: number;
  expectedCorpus: number;
  isInSIPPhase: boolean;
  isInWaitingPhase: boolean;
  isInSWPPhase: boolean;
}

// KPI data for status banner
export interface StatusKPI {
  label: string;
  value: string | number;
  subtext?: string;
  trend?: 'positive' | 'negative' | 'neutral';
  icon?: string;
}

// Context state for Financial Planning
export interface FinancialPlanningState {
  // Core inputs from calculator
  inputs: CalculatorInputs | null;
  results: CalculationResults | null;
  projections: DetailedProjection[];

  // Lifestyle planner state
  lifestyleShift: number;
  lifestyleData: LifestyleData | null;

  // Health stress state
  healthCategory: HealthCategory;
  healthStressData: HealthStressData | null;

  // UI state
  isLoading: boolean;
  hasCalculated: boolean;
  activeTab: string;
}

// Context actions
export interface FinancialPlanningActions {
  setInputs: (inputs: CalculatorInputs) => Promise<void>;
  calculateResults: () => void;
  setLifestyleShift: (shift: number) => void;
  setHealthCategory: (category: HealthCategory) => void;
  setActiveTab: (tab: string) => void;
  resetState: () => void;
  loadFromStorage: () => void;
}

// Full context type
export type FinancialPlanningContextType = FinancialPlanningState & FinancialPlanningActions;
