
import { CalculatorInputs, CalculationResults, YearlyProjection } from '@/types/calculator';

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

// Simulate full lifecycle for a given SIP amount.
// Returns the depletion age, or null if corpus lasts until life expectancy.
function simulateDepletionAge(inputs: CalculatorInputs, trialSIP: number): number | null {
  const annualReturn = inputs.returnDuringSIPAndWaiting / 100;
  const swpReturn = inputs.returnDuringSWP / 100;
  const sipEndYear = inputs.yearsForSIP;
  const swpStartYear = inputs.yearsForSIP + inputs.waitingYearsBeforeSWP;

  const inflatedMonthlyExpenses = CEILING(
    inputs.currentMonthlyExpenses * Math.pow(1 + inputs.inflation / 100, swpStartYear),
    1000
  );

  let corpus = inputs.initialPortfolioValue;
  let prevSWP = 0;

  for (let year = 1; year <= inputs.lifeExpectancy - inputs.age; year++) {
    const isInSIPPhase = year <= sipEndYear;
    const isInWaitingPhase = year > sipEndYear && year <= swpStartYear;
    const isInSWPPhase = year > swpStartYear;

    let monthlySIP = 0;
    if (isInSIPPhase) {
      monthlySIP = trialSIP * Math.pow(1 + inputs.growthInSIP / 100, year - 1);
    }

    let monthlySWP = 0;
    if (isInSWPPhase) {
      if (swpStartYear + 1 === year) {
        monthlySWP = inflatedMonthlyExpenses;
      } else {
        monthlySWP = prevSWP * (1 + inputs.growthInSWP / 100);
      }
      prevSWP = monthlySWP;
    }

    if (isInSIPPhase || isInWaitingPhase) {
      const rate = Math.pow(1 + annualReturn, 1 / 12) - 1;
      corpus = FV(rate, 12, -monthlySIP, -corpus, 1);
    } else {
      const rate = Math.pow(1 + swpReturn, 1 / 12) - 1;
      corpus = FV(rate, 12, monthlySWP, -corpus, 1);
    }

    if (corpus < 0) return inputs.age + year;
  }
  return null; // Sustained through life expectancy
}

// Binary search: find the minimum starting SIP that sustains corpus until life expectancy.
function calculateRequiredSIP(inputs: CalculatorInputs): number {
  // If zero SIP already sustains (large initial portfolio), required is 0
  if (simulateDepletionAge(inputs, 0) === null) return 0;

  let low = 0;
  let high = Math.max(inputs.sipAmount * 5, 100000);

  // Ensure upper bound is sufficient
  while (simulateDepletionAge(inputs, high) !== null && high < 1e8) {
    high *= 2;
  }

  // 40 iterations gives precision within ₹1
  for (let i = 0; i < 40; i++) {
    const mid = (low + high) / 2;
    if (simulateDepletionAge(inputs, mid) !== null) {
      low = mid;
    } else {
      high = mid;
    }
  }

  // Round up to nearest ₹500
  return Math.ceil(high / 500) * 500;
}

// Binary search: find the minimum corpus at retirement that sustains SWP withdrawals
// until life expectancy. Uses the same FV-based monthly compounding as the projection table.
function calculateRequiredCorpus(inputs: CalculatorInputs): number {
  const yearsToRetirement = inputs.yearsForSIP + inputs.waitingYearsBeforeSWP;
  const retirementYears = inputs.lifeExpectancy - (inputs.age + yearsToRetirement);
  if (retirementYears <= 0) return 0;

  const swpReturn = inputs.returnDuringSWP / 100;
  const monthlyRate = Math.pow(1 + swpReturn, 1 / 12) - 1;
  const firstYearSWP = CEILING(
    inputs.currentMonthlyExpenses * Math.pow(1 + inputs.inflation / 100, yearsToRetirement),
    1000
  );

  // Helper: does a given corpus sustain through retirement?
  function sustains(startingCorpus: number): boolean {
    let corpus = startingCorpus;
    let monthlySWP = firstYearSWP;
    for (let year = 0; year < retirementYears; year++) {
      corpus = FV(monthlyRate, 12, monthlySWP, -corpus, 1);
      if (corpus < 0) return false;
      monthlySWP *= (1 + inputs.growthInSWP / 100);
    }
    return true;
  }

  let low = 0;
  let high = firstYearSWP * 12 * retirementYears; // no-return upper bound

  for (let i = 0; i < 40; i++) {
    const mid = (low + high) / 2;
    if (sustains(mid)) high = mid; else low = mid;
  }

  return Math.ceil(high / 100000) * 100000; // Round up to nearest lakh
}

export const calculateFinancialFreedom = (inputs: CalculatorInputs): CalculationResults => {
  const {
    age,
    lifeExpectancy,
    initialPortfolioValue,
    sipAmount,
    yearsForSIP,
    returnDuringSIPAndWaiting,
    growthInSIP,
    waitingYearsBeforeSWP,
    currentMonthlyExpenses,
    inflation,
    returnDuringSWP,
    growthInSWP
  } = inputs;

  const currentAge = age;
  const yearsToRetirement = yearsForSIP + waitingYearsBeforeSWP;

  // Required corpus at retirement — uses same FV-based simulation as projection table
  const requiredCorpus = calculateRequiredCorpus(inputs);

  // Present value of required corpus (discounted back to today)
  const requiredCorpusToday = requiredCorpus / Math.pow(1 + inflation / 100, yearsToRetirement);

  // Freedom age (when SWP can start)
  const freedomAge = currentAge + yearsToRetirement;
  const actualYearsToFreedom = yearsToRetirement;

  // Future annual expenses at retirement (for reporting)
  const futureAnnualExpenses = currentMonthlyExpenses * 12 *
    Math.pow(1 + inflation / 100, yearsToRetirement);

  // Check if current plan is sufficient (will be validated by depletion check below)
  const currentProgress = Math.min(100, (initialPortfolioValue / Math.max(requiredCorpusToday, 1)) * 100);
  
  // Binary-search for the minimum starting SIP that sustains corpus until life expectancy
  const requiredMonthlySIP = calculateRequiredSIP(inputs);
  const currentMonthlySurplus = sipAmount - requiredMonthlySIP;
  
  // Emergency fund calculation
  const emergencyFundRequired = currentMonthlyExpenses * 6;
  
  // Generate yearly projections
  const yearlyProjections: YearlyProjection[] = [];
  const monthlyRate = returnDuringSIPAndWaiting / 100 / 12;
  
  for (let year = 0; year <= Math.min(yearsForSIP + waitingYearsBeforeSWP, 30); year++) {
    const age = currentAge + year;
    let savingsGrowth = initialPortfolioValue * Math.pow(1 + returnDuringSIPAndWaiting / 100, year);
    
    let sipContributions = 0;
    if (year <= yearsForSIP && year > 0) {
      const months = year * 12;
      if (monthlyRate > 0) {
        sipContributions = sipAmount * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
      } else {
        sipContributions = sipAmount * months;
      }
    } else if (year > yearsForSIP) {
      // SIP completed, only growth
      const sipMonthsCompleted = yearsForSIP * 12;
      if (monthlyRate > 0) {
        sipContributions = sipAmount * ((Math.pow(1 + monthlyRate, sipMonthsCompleted) - 1) / monthlyRate);
        sipContributions *= Math.pow(1 + returnDuringSIPAndWaiting / 100, year - yearsForSIP);
      } else {
        sipContributions = sipAmount * sipMonthsCompleted;
      }
    }
    
    const totalValue = savingsGrowth + sipContributions;
    
    yearlyProjections.push({
      year,
      age,
      savings: savingsGrowth,
      sipContributions,
      totalValue
    });
  }
  
  // Calculate SWP start age
  const swpStartAge = freedomAge;
  
  // Depletion check — uses the same Excel-accurate FV simulation as calculateRequiredSIP,
  // replacing the old approximation loop (annualReturn/12 monthly rate + annual lump SWP).
  const depletionAge = simulateDepletionAge(inputs, sipAmount);
  const corpusDepletesBeforeLifeExpectancy = depletionAge !== null;
  const corpusDepletionAge: number | null = depletionAge;
  const canAchieveGoal = !corpusDepletesBeforeLifeExpectancy;

  return {
    requiredCorpus,
    requiredCorpusToday,
    requiredMonthlySIP,
    currentMonthlySurplus,
    yearsToFreedom: actualYearsToFreedom,
    freedomAge,
    canAchieveGoal,
    currentProgress,
    emergencyFundRequired,
    futureAnnualExpenses,
    yearlyProjections,
    swpStartAge,
    corpusDepletionAge,
    corpusDepletesBeforeLifeExpectancy
  };
};
