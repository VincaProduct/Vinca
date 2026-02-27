import { CalculatorInputs } from '@/types/calculator';

// Excel-style Future Value (monthly compounding)
function FV(rate: number, nper: number, pmt: number, pv: number = 0, type: number = 0): number {
  if (rate === 0) return -(pv + pmt * nper);
  const pvFactor = Math.pow(1 + rate, nper);
  const pmtFactor = ((Math.pow(1 + rate, nper) - 1) / rate) * (1 + rate * type);
  return -(pv * pvFactor + pmt * pmtFactor);
}

function CEILING(number: number, significance: number): number {
  if (significance === 0 || number === 0) return 0;
  return Math.ceil(number / significance) * significance;
}

export interface EarlyRetirementParams extends CalculatorInputs {
  surplusAllocationPercent: number; // 0-100
}

export interface EarlyRetirementOutcome {
  monthlySurplus: number;
  surplusUsed: number;
  adjustedMonthlySIP: number;
  savingsRate: number;
  corpusAtPlannedRetirement: number;
  corpusAtEarlyRetirement: number | null;
  earlyRetirementAge: number | null;
  yearsEarly: number | null;
}

/**
 * Calculate corpus at a specific age given the inputs and target age.
 * This reuses the logic from calculateFinancialFreedom.
 */
function calculateCorpusAtAge(inputs: CalculatorInputs, adjustedSIP: number, targetAge: number): number {
  const currentAge = inputs.age;
  const yearsElapsed = targetAge - currentAge;
  
  if (yearsElapsed < 0) return inputs.initialPortfolioValue;
  if (yearsElapsed === 0) return inputs.initialPortfolioValue;

  const annualReturn = inputs.returnDuringSIPAndWaiting / 100;
  const monthlyRate = Math.pow(1 + annualReturn, 1 / 12) - 1;
  const sipEndYear = inputs.yearsForSIP;
  const swpStartYear = inputs.yearsForSIP + inputs.waitingYearsBeforeSWP;

  let corpus = inputs.initialPortfolioValue;

  for (let year = 1; year <= yearsElapsed; year++) {
    const isInSIPPhase = year <= sipEndYear;
    const isInWaitingPhase = year > sipEndYear && year <= swpStartYear;

    if (isInSIPPhase || isInWaitingPhase) {
      // SIP phase or waiting phase - only growth
      let monthlySIP = 0;
      if (isInSIPPhase) {
        const sipGrowthRate = inputs.growthInSIP / 100;
        monthlySIP = adjustedSIP * Math.pow(1 + sipGrowthRate, year - 1);
      }

      // Use FV for monthly compounding
      corpus = FV(monthlyRate, 12, -monthlySIP, -corpus, 1);
    } else {
      // SWP phase - should not reach here for early retirement calculation
      break;
    }
  }

  return Math.max(0, corpus);
}

/**
 * Check if corpus can sustain till lifespan using monthly FV logic
 */
function canCorpusSustainTillLifespan(
  startingCorpus: number,
  startingAge: number,
  currentAge: number,
  lifespan: number,
  monthlyExpenses: number,
  inflationRate: number,
  retirementReturns: number,
  yearlyWithdrawalIncrease: number
): boolean {
  const yearsToStartingAge = startingAge - currentAge; // Years from now to early retirement
  const retirementYears = lifespan - startingAge;

  if (retirementYears <= 0) return startingCorpus > 0;

  const swpReturn = retirementReturns / 100;
  const monthlyRate = Math.pow(1 + swpReturn, 1 / 12) - 1;

  // First year monthly SWP (inflated from today to startingAge)
  const firstYearMonthlyExpenses = CEILING(
    monthlyExpenses * Math.pow(1 + inflationRate / 100, yearsToStartingAge),
    1000
  );

  let corpus = startingCorpus;
  let monthlySWP = firstYearMonthlyExpenses;

  for (let year = 0; year < retirementYears; year++) {
    // Apply FV for 12 months of withdrawals and returns
    corpus = FV(monthlyRate, 12, monthlySWP, -corpus, 1);
    
    if (corpus < 0) return false;
    
    // Increase withdrawal for next year
    monthlySWP *= (1 + yearlyWithdrawalIncrease / 100);
  }

  return corpus > 0;
}

/**
 * Calculate early retirement outcome based on surplus allocation
 */
export function calculateEarlyRetirementOutcome(
  params: EarlyRetirementParams
): EarlyRetirementOutcome {
  const inputs: CalculatorInputs = {
    age: params.age,
    monthlyIncome: params.monthlyIncome,
    currentMonthlyExpenses: params.currentMonthlyExpenses,
    lifeExpectancy: params.lifeExpectancy,
    initialPortfolioValue: params.initialPortfolioValue,
    sipAmount: params.sipAmount,
    yearsForSIP: params.yearsForSIP,
    returnDuringSIPAndWaiting: params.returnDuringSIPAndWaiting,
    growthInSIP: params.growthInSIP,
    waitingYearsBeforeSWP: params.waitingYearsBeforeSWP,
    inflation: params.inflation,
    returnDuringSWP: params.returnDuringSWP,
    growthInSWP: params.growthInSWP,
  };

  // 1. Calculate surplus (CRITICAL: Income - Expenses only, SIP already in expenses)
  const monthlySurplus = (inputs.monthlyIncome || 0) - (inputs.currentMonthlyExpenses || 0);

  // Handle zero/negative surplus or missing income
  if (monthlySurplus <= 0 || !inputs.monthlyIncome || inputs.monthlyIncome <= 0) {
    // Calculate corpus at planned retirement with original SIP
    const plannedRetirementAge = inputs.age + inputs.yearsForSIP + inputs.waitingYearsBeforeSWP;
    const corpusAtPlanned = calculateCorpusAtAge(inputs, inputs.sipAmount, plannedRetirementAge);

    return {
      monthlySurplus,
      surplusUsed: 0,
      adjustedMonthlySIP: inputs.sipAmount,
      savingsRate: inputs.sipAmount / Math.max(inputs.monthlyIncome, 1),
      corpusAtPlannedRetirement: corpusAtPlanned,
      corpusAtEarlyRetirement: null,
      earlyRetirementAge: null,
      yearsEarly: null
    };
  }

  // 2. Calculate surplus allocation
  const surplusUsed = monthlySurplus * (params.surplusAllocationPercent / 100);
  const adjustedMonthlySIP = inputs.sipAmount + surplusUsed;
  const savingsRate = adjustedMonthlySIP / Math.max(inputs.monthlyIncome, 1);

  // 3. Calculate corpus at planned retirement using adjusted SIP
  const plannedRetirementAge = inputs.age + inputs.yearsForSIP + inputs.waitingYearsBeforeSWP;
  const corpusAtPlannedRetirement = calculateCorpusAtAge(inputs, adjustedMonthlySIP, plannedRetirementAge);

  // 4. Find earliest retirement age
  const earliestTestAge = inputs.age + 5;
  let earlyRetirementAge: number | null = null;

  for (let testAge = earliestTestAge; testAge <= plannedRetirementAge; testAge++) {
    // Accumulate corpus till test age
    const corpusAtTestAge = calculateCorpusAtAge(inputs, adjustedMonthlySIP, testAge);

    // Check if corpus sustains till lifespan (use existing withdrawal logic)
    const isSustainable = canCorpusSustainTillLifespan(
      corpusAtTestAge,
      testAge,
      inputs.age,
      inputs.lifeExpectancy,
      inputs.currentMonthlyExpenses,
      inputs.inflation,
      inputs.returnDuringSWP,
      inputs.growthInSWP
    );

    if (isSustainable) {
      earlyRetirementAge = testAge;
      break;
    }
  }

  // 5. Calculate corpus at early retirement age (if found)
  const corpusAtEarlyRetirement = earlyRetirementAge 
    ? calculateCorpusAtAge(inputs, adjustedMonthlySIP, earlyRetirementAge)
    : null;

  // 6. Calculate years early if possible
  const yearsEarly = earlyRetirementAge 
    ? plannedRetirementAge - earlyRetirementAge 
    : null;

  return {
    monthlySurplus,
    surplusUsed,
    adjustedMonthlySIP,
    savingsRate,
    corpusAtPlannedRetirement,
    corpusAtEarlyRetirement,
    earlyRetirementAge,
    yearsEarly
  };
}
