
export interface CalculatorInputs {
  age: number;
  lifeExpectancy: number;
  initialPortfolioValue: number;
  sipAmount: number;
  yearsForSIP: number;
  returnDuringSIPAndWaiting: number;
  growthInSIP: number;
  waitingYearsBeforeSWP: number;
  currentMonthlyExpenses: number;
  monthlyIncome: number;
  inflation: number;
  returnDuringSWP: number;
  growthInSWP: number;
}

export interface YearlyProjection {
  year: number;
  age: number;
  savings: number;
  sipContributions: number;
  totalValue: number;
}

export interface CalculationResults {
  requiredCorpus: number;
  requiredCorpusToday: number;
  requiredMonthlySIP: number;
  currentMonthlySurplus: number;
  yearsToFreedom: number;
  freedomAge: number;
  canAchieveGoal: boolean;
  currentProgress: number;
  emergencyFundRequired: number;
  futureAnnualExpenses: number;
  yearlyProjections: YearlyProjection[];
  swpStartAge: number;
  corpusDepletionAge: number | null;
  corpusDepletesBeforeLifeExpectancy: boolean;
}
