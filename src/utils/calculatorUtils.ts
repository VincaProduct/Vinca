
import { CalculatorInputs, CalculationResults, YearlyProjection } from '@/types/calculator';


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
  const yearsToLifeExpectancy = lifeExpectancy - currentAge;
  const currentAnnualExpenses = currentMonthlyExpenses * 12;
  
  // Calculate future annual expenses (adjusted for inflation)
  const futureAnnualExpenses = currentAnnualExpenses * Math.pow(1 + inflation / 100, yearsToLifeExpectancy);
  
  // Calculate SIP growth over time
  const monthlyGrowthRate = growthInSIP / 100 / 12;
  const sipMonths = yearsForSIP * 12;
  let totalSIPValue = 0;
  
  if (monthlyGrowthRate > 0) {
    totalSIPValue = sipAmount * ((Math.pow(1 + monthlyGrowthRate, sipMonths) - 1) / monthlyGrowthRate);
  } else {
    totalSIPValue = sipAmount * sipMonths;
  }
  
  // Calculate portfolio growth during SIP period
  const portfolioAfterSIP = initialPortfolioValue * Math.pow(1 + returnDuringSIPAndWaiting / 100, yearsForSIP);
  
  // Total portfolio value after SIP period
  const totalPortfolioAfterSIP = portfolioAfterSIP + totalSIPValue;
  
  // Calculate portfolio growth during waiting period
  const portfolioAfterWaiting = totalPortfolioAfterSIP * Math.pow(1 + returnDuringSIPAndWaiting / 100, waitingYearsBeforeSWP);
  
  // Calculate required corpus for SWP period
  const swpPeriodYears = lifeExpectancy - (currentAge + yearsForSIP + waitingYearsBeforeSWP);
  const requiredCorpus = futureAnnualExpenses * swpPeriodYears;
  
  // Calculate today's value of required corpus
  const requiredCorpusToday = requiredCorpus / Math.pow(1 + inflation / 100, yearsToLifeExpectancy);
  
  // Calculate if current plan is sufficient
  const canAchieveGoal = portfolioAfterWaiting >= requiredCorpus;
  
  // Calculate current progress
  const currentProgress = Math.min(100, (initialPortfolioValue / requiredCorpusToday) * 100);
  
  // Calculate freedom age (when SWP can start)
  const freedomAge = currentAge + yearsForSIP + waitingYearsBeforeSWP;
  const actualYearsToFreedom = yearsForSIP + waitingYearsBeforeSWP;
  
  // Calculate required monthly SIP (simplified calculation)
  const requiredMonthlySIP = sipAmount;
  const currentMonthlySurplus = sipAmount; // Using SIP amount as surplus for now
  
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
  
  // Calculate corpus depletion using detailed table logic
  let corpusDepletionAge: number | null = null;
  let corpusDepletesBeforeLifeExpectancy = false;
  
  // Generate detailed projections to find first negative corpus
  let currentCorpus = initialPortfolioValue;
  const monthlyReturn = returnDuringSIPAndWaiting / 100 / 12;
  const annualReturn = returnDuringSIPAndWaiting / 100;
  const swpReturnRate = returnDuringSWP / 100;
  
  // Calculate inflated monthly expenses for SWP period
  const inflatedMonthlyExpenses = currentMonthlyExpenses * 
    Math.pow(1 + inflation / 100, yearsForSIP + waitingYearsBeforeSWP);
  
  // Check from year 1 onwards
  for (let year = 1; year <= Math.min(50, lifeExpectancy - currentAge); year++) {
    const age = currentAge + year;
    
    // Determine phase
    const isInSIPPhase = year <= yearsForSIP;
    const isInWaitingPhase = year > yearsForSIP && year <= (yearsForSIP + waitingYearsBeforeSWP);
    const isInSWPPhase = year > (yearsForSIP + waitingYearsBeforeSWP);
    
    // Calculate SIP amount (with growth if applicable)
    let monthlySIP = 0;
    if (isInSIPPhase) {
      const sipGrowthRate = growthInSIP / 100;
      monthlySIP = sipAmount * Math.pow(1 + sipGrowthRate, year - 1);
    }
    
    // Calculate returns
    const returnRate = isInSWPPhase ? swpReturnRate : annualReturn;
    
    // Calculate SWP amount
    let monthlySWP = 0;
    if (isInSWPPhase) {
      const swpGrowthRate = growthInSWP / 100;
      monthlySWP = inflatedMonthlyExpenses * Math.pow(1 + swpGrowthRate, year - (yearsForSIP + waitingYearsBeforeSWP));
    }
    
    // Calculate corpus at beginning of year
    let beginningCorpus = currentCorpus;
    
    // Add SIP contributions throughout the year and calculate compounding
    if (isInSIPPhase) {
      for (let month = 1; month <= 12; month++) {
        beginningCorpus += monthlySIP;
        beginningCorpus *= (1 + monthlyReturn);
      }
    } else {
      // Apply annual return
      beginningCorpus *= (1 + returnRate);
    }
    
    // Subtract SWP withdrawals
    if (isInSWPPhase) {
      beginningCorpus -= (monthlySWP * 12);
    }
    
    // Calculate expected corpus at end of year
    const expectedCorpus = beginningCorpus;
    
    // Check if this is the first negative corpus
    if (expectedCorpus < 0 && corpusDepletionAge === null) {
      corpusDepletionAge = age;
      corpusDepletesBeforeLifeExpectancy = true;
      break;
    }
    
    currentCorpus = expectedCorpus;
  }

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
