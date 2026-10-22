/**
 * AI Finance Advisor 4.0 - Financial Mathematics Engine
 * Precision financial planning, compounding models, allocation logic, and health metrics.
 */

export type RiskTolerance = 'Low' | 'Moderate' | 'High';
export type ScenarioType = 'conservative' | 'moderate' | 'optimistic';
export type AssetClass =
  | 'emergencyFund'
  | 'fixedDeposit'
  | 'gold'
  | 'debtMutualFunds'
  | 'hybridMutualFunds'
  | 'equityMutualFunds'
  | 'stocks'
  | 'cashLiquid';

export interface UserFinancialProfile {
  age: number;
  occupation: string;
  knowledgeLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  dependents: number;
  goal: string;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyEMI: number;
  existingSavings: number;
  riskTolerance: RiskTolerance;
  expectedSalaryGrowth: number; // e.g. 8 for 8%
  investmentHorizonYears: number; // e.g. 5, 10, 15
}

export interface ScenarioReturnRates {
  emergencyCash: number;
  fixedDeposit: number;
  gold: number;
  debtMutualFunds: number;
  hybridMutualFunds: number;
  equityMutualFunds: number;
  stocks: number;
}

export const SCENARIO_RETURN_RATES: Record<ScenarioType, ScenarioReturnRates> = {
  conservative: {
    emergencyCash: 3.0,
    fixedDeposit: 5.5,
    gold: 3.0,
    debtMutualFunds: 4.5,
    hybridMutualFunds: 5.0,
    equityMutualFunds: 6.0,
    stocks: 5.0,
  },
  moderate: {
    emergencyCash: 3.0,
    fixedDeposit: 6.5,
    gold: 7.0,
    debtMutualFunds: 6.5,
    hybridMutualFunds: 9.0,
    equityMutualFunds: 12.0,
    stocks: 13.0,
  },
  optimistic: {
    emergencyCash: 3.0,
    fixedDeposit: 7.5,
    gold: 10.0,
    debtMutualFunds: 7.5,
    hybridMutualFunds: 12.0,
    equityMutualFunds: 15.0,
    stocks: 17.0,
  },
};

export const BASE_ANNUAL_RETURNS = SCENARIO_RETURN_RATES.moderate;

export interface FinancialHealthMetrics {
  monthlySurplus: number;
  savingsRate: number | null;
  expenseRatio: number | null;
  emiRatio: number | null;
  essentialMonthlyExpenses: number;
  emergencyFundTarget3m: number;
  emergencyFundTarget6m: number;
  emergencyFundTarget12m: number;
  emergencyFundGap: number;
  isDeficit: boolean;
  status: 'healthy' | 'caution' | 'critical';
  statusLabel: string;
}

export interface AllocationItem {
  id: string;
  name: string;
  category: string;
  percentage: number;
  monthlyAmount: number;
  lumpSumAmount: number;
  assumedAnnualReturn: number;
  purpose: string;
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Very High';
  color: string;
}

export interface ProtectionAdvice {
  termInsuranceCover: number;
  termInsuranceNote: string;
  healthInsuranceCover: number;
  healthInsuranceNote: string;
}

export interface PortfolioAllocation {
  items: AllocationItem[];
  totalMonthlyAllocated: number;
  totalLumpSumAllocated: number;
  emergencyReserveAllocated: number;
  emergencyFundGap: number;
  protection: ProtectionAdvice;
  methodologyNote: string;
  warningNotice?: string;
}

export interface YearProjectionPoint {
  year: number;
  label: string;
  monthlySIPAmount: number;
  stocksInvested: number;
  stocksValue: number;
  mutualFundsInvested: number;
  mutualFundsValue: number;
  goldInvested: number;
  goldValue: number;
  cashInvested: number;
  cashValue: number;
  totalInvested: number;
  totalPortfolioValue: number;
  realPurchasingPower: number; // Inflation adjusted
  estimatedGrowth: number;
}

export interface PortfolioProjectionSummary {
  scenario: ScenarioType;
  horizonYears: number;
  annualInflationRate: number;
  hasSalaryGrowthStepUp: boolean;
  totalInvested: number;
  estimatedGains: number;
  finalNominalValue: number;
  finalRealValue: number;
  assumedWeightedReturnPct: number;
  yearlyData: YearProjectionPoint[];
}

/**
 * 1. Financial Health Calculation Engine
 */
export function calculateFinancialHealth(
  monthlyIncome: number,
  monthlyExpenses: number,
  monthlyEMI: number,
  existingSavings: number,
  emergencyMonthsTarget: number = 6
): FinancialHealthMetrics {
  const safeIncome = Math.max(0, monthlyIncome);
  const safeExpenses = Math.max(0, monthlyExpenses);
  const safeEMI = Math.max(0, monthlyEMI);
  const safeSavings = Math.max(0, existingSavings);

  const monthlySurplus = safeIncome - safeExpenses - safeEMI;
  const essentialMonthlyExpenses = safeExpenses + safeEMI;

  const savingsRate = safeIncome > 0 ? (monthlySurplus / safeIncome) * 100 : null;
  const expenseRatio = safeIncome > 0 ? (safeExpenses / safeIncome) * 100 : null;
  const emiRatio = safeIncome > 0 ? (safeEMI / safeIncome) * 100 : null;

  const emergencyFundTarget3m = essentialMonthlyExpenses * 3;
  const emergencyFundTarget6m = essentialMonthlyExpenses * 6;
  const emergencyFundTarget12m = essentialMonthlyExpenses * 12;

  const selectedTarget =
    emergencyMonthsTarget === 3
      ? emergencyFundTarget3m
      : emergencyMonthsTarget === 12
      ? emergencyFundTarget12m
      : emergencyFundTarget6m;

  const emergencyFundGap = Math.max(0, selectedTarget - safeSavings);
  const isDeficit = monthlySurplus < 0;

  let status: 'healthy' | 'caution' | 'critical' = 'healthy';
  let statusLabel = 'Sound Financial Health';

  if (isDeficit) {
    status = 'critical';
    statusLabel = 'Cash Flow Deficit';
  } else if (emiRatio !== null && emiRatio > 45) {
    status = 'critical';
    statusLabel = 'Heavy Debt Burden';
  } else if (savingsRate !== null && savingsRate < 15) {
    status = 'caution';
    statusLabel = 'Low Savings Rate';
  } else if (emergencyFundGap > 0) {
    status = 'caution';
    statusLabel = 'Emergency Buffer Incomplete';
  }

  return {
    monthlySurplus,
    savingsRate,
    expenseRatio,
    emiRatio,
    essentialMonthlyExpenses,
    emergencyFundTarget3m,
    emergencyFundTarget6m,
    emergencyFundTarget12m,
    emergencyFundGap,
    isDeficit,
    status,
    statusLabel,
  };
}

/**
 * 2. Portfolio Allocation Engine
 * Starting allocation templates for long-term investment capital:
 * - Low: Equity MF 20%, Debt MF 55%, Gold 10%, Stocks 5%, Cash/Liquid 10%
 * - Moderate: Equity MF 40%, Debt MF 30%, Gold 10%, Stocks 10%, Cash/Liquid 10%
 * - High: Equity MF 55%, Debt MF 15%, Gold 10%, Stocks 15%, Cash/Liquid 5%
 *
 * Emergency reserves are tracked separately and not mixed with equity investments.
 * Insurance is tracked as protection coverage, not as investment return.
 */
export function generatePortfolioAllocation(
  profile: UserFinancialProfile,
  health: FinancialHealthMetrics,
  scenario: ScenarioType = 'moderate'
): PortfolioAllocation {
  const rates = SCENARIO_RETURN_RATES[scenario];
  const { monthlySurplus } = health;
  const isNegativeCashFlow = monthlySurplus <= 0;

  // Protect user: If monthly cash flow is negative or zero, do not recommend positive recurring investment
  const investableMonthly = isNegativeCashFlow ? 0 : monthlySurplus;

  // Separate emergency reserve from investable existing savings
  // Emergency target 6m
  const emergencyTarget = health.emergencyFundTarget6m;
  const existingSavings = Math.max(0, profile.existingSavings);
  const emergencyReserveAllocated = Math.min(existingSavings, emergencyTarget);
  const investableLumpSum = Math.max(0, existingSavings - emergencyReserveAllocated);

  let template: {
    equityMF: number;
    debtMF: number;
    gold: number;
    stocks: number;
    cash: number;
  };

  switch (profile.riskTolerance) {
    case 'Low':
      template = { equityMF: 20, debtMF: 55, gold: 10, stocks: 5, cash: 10 };
      break;
    case 'High':
      template = { equityMF: 55, debtMF: 15, gold: 10, stocks: 15, cash: 5 };
      break;
    case 'Moderate':
    default:
      template = { equityMF: 40, debtMF: 30, gold: 10, stocks: 10, cash: 10 };
      break;
  }

  // Adjust template if investment horizon is very short (< 3 years) to prevent capital destruction
  if (profile.investmentHorizonYears < 3) {
    if (profile.riskTolerance === 'High') {
      template = { equityMF: 25, debtMF: 50, gold: 10, stocks: 5, cash: 10 };
    } else if (profile.riskTolerance === 'Moderate') {
      template = { equityMF: 15, debtMF: 60, gold: 10, stocks: 5, cash: 10 };
    } else {
      template = { equityMF: 5, debtMF: 70, gold: 10, stocks: 0, cash: 15 };
    }
  }

  // Ensure strict 100% total
  const totalPct =
    template.equityMF +
    template.debtMF +
    template.gold +
    template.stocks +
    template.cash;
  if (totalPct !== 100) {
    template.debtMF += 100 - totalPct;
  }

  const items: AllocationItem[] = [
    {
      id: 'equity-mf',
      name: 'Equity Mutual Funds',
      category: 'Diversified Equity',
      percentage: template.equityMF,
      monthlyAmount: Math.round((investableMonthly * template.equityMF) / 100),
      lumpSumAmount: Math.round((investableLumpSum * template.equityMF) / 100),
      assumedAnnualReturn: rates.equityMutualFunds,
      purpose: 'Long-term wealth creation, beats inflation across economic cycles.',
      riskLevel: 'High',
      color: '#3B82F6', // Electric Blue
    },
    {
      id: 'debt-mf',
      name: 'Debt Mutual Funds / Fixed Income',
      category: 'Fixed Income',
      percentage: template.debtMF,
      monthlyAmount: Math.round((investableMonthly * template.debtMF) / 100),
      lumpSumAmount: Math.round((investableLumpSum * template.debtMF) / 100),
      assumedAnnualReturn: rates.debtMutualFunds,
      purpose: 'Capital preservation, predictable accrual yield, and portfolio stability.',
      riskLevel: 'Low',
      color: '#10B981', // Emerald Teal
    },
    {
      id: 'stocks',
      name: 'Diversified Stocks',
      category: 'Direct Equity',
      percentage: template.stocks,
      monthlyAmount: Math.round((investableMonthly * template.stocks) / 100),
      lumpSumAmount: Math.round((investableLumpSum * template.stocks) / 100),
      assumedAnnualReturn: rates.stocks,
      purpose: 'High growth participation in established market leaders and blue-chip enterprises.',
      riskLevel: 'Very High',
      color: '#F43F5E', // Coral Red
    },
    {
      id: 'gold',
      name: 'Sovereign Gold / Gold ETFs',
      category: 'Precious Metals',
      percentage: template.gold,
      monthlyAmount: Math.round((investableMonthly * template.gold) / 100),
      lumpSumAmount: Math.round((investableLumpSum * template.gold) / 100),
      assumedAnnualReturn: rates.gold,
      purpose: 'Hedge against currency depreciation, market volatility, and macro inflation.',
      riskLevel: 'Moderate',
      color: '#F59E0B', // Amber Gold
    },
    {
      id: 'cash-liquid',
      name: 'Liquid Funds / Cash Equivalent',
      category: 'Cash & Equivalents',
      percentage: template.cash,
      monthlyAmount: Math.round((investableMonthly * template.cash) / 100),
      lumpSumAmount: Math.round((investableLumpSum * template.cash) / 100),
      assumedAnnualReturn: rates.emergencyCash,
      purpose: 'Opportunistic liquidity and short-term tactical reserves.',
      riskLevel: 'Low',
      color: '#8B5CF6', // Violet
    },
  ];

  // Adjust monthlyAmount and lumpSumAmount to sum exactly to investable totals
  let runningMonthly = items.reduce((acc, it) => acc + it.monthlyAmount, 0);
  let diffMonthly = investableMonthly - runningMonthly;
  if (diffMonthly !== 0 && items.length > 0) {
    items[0].monthlyAmount += diffMonthly;
  }

  let runningLumpSum = items.reduce((acc, it) => acc + it.lumpSumAmount, 0);
  let diffLumpSum = investableLumpSum - runningLumpSum;
  if (diffLumpSum !== 0 && items.length > 0) {
    items[0].lumpSumAmount += diffLumpSum;
  }

  // Protection recommendations (pure risk mitigation, not investment)
  const annualIncome = profile.monthlyIncome * 12;
  const termCover = Math.max(5000000, annualIncome * 15);
  const healthCover = profile.dependents > 2 ? 1500000 : 1000000;

  const protection: ProtectionAdvice = {
    termInsuranceCover: termCover,
    termInsuranceNote: `Pure Term Life Cover of 15× annual gross income (₹${(termCover / 100000).toFixed(0)} Lakhs) recommended for dependent security. Zero investment return assumption.`,
    healthInsuranceCover: healthCover,
    healthInsuranceNote: `Comprehensive Health Insurance with ₹${(healthCover / 100000).toFixed(0)} Lakhs base floater sum insured to prevent sudden medical out-of-pocket costs.`,
  };

  let warningNotice: string | undefined;
  if (isNegativeCashFlow) {
    warningNotice =
      'Cash flow is currently zero or negative. We strictly do not recommend initiating market investments with debt or deficit. Focus first on debt paydown and essential expense control.';
  } else if (health.emergencyFundGap > 0) {
    warningNotice = `You have an emergency reserve gap of ₹${health.emergencyFundGap.toLocaleString('en-IN')}. We strongly advise completing this buffer before aggressive equity allocations.`;
  }

  return {
    items,
    totalMonthlyAllocated: investableMonthly,
    totalLumpSumAllocated: investableLumpSum,
    emergencyReserveAllocated,
    emergencyFundGap: health.emergencyFundGap,
    protection,
    methodologyNote: `Allocation tailored for ${profile.riskTolerance} risk profile over ${profile.investmentHorizonYears} years. Simulation rate assumptions: Conservative, Moderate, or Optimistic.`,
    warningNotice,
  };
}

/**
 * 3. Monthly SIP Compounding Math
 * Formula for end-of-month contributions:
 * i = (1 + annualReturn / 100)^(1/12) - 1
 * n = 12 * years
 * If i === 0: FV = P * n
 * Else: FV = P * [((1 + i)^n - 1) / i]
 */
export function calculateSIP(
  monthlyInvestment: number,
  annualRatePct: number,
  years: number
): {
  investedAmount: number;
  estimatedGains: number;
  futureValue: number;
} {
  const P = Math.max(0, monthlyInvestment);
  const n = Math.max(0, Math.round(years * 12));

  if (P === 0 || n === 0) {
    return { investedAmount: 0, estimatedGains: 0, futureValue: 0 };
  }

  if (annualRatePct === 0) {
    const invested = P * n;
    return { investedAmount: invested, estimatedGains: 0, futureValue: invested };
  }

  const i = Math.pow(1 + annualRatePct / 100, 1 / 12) - 1;
  const fv = P * ((Math.pow(1 + i, n) - 1) / i);
  const investedAmount = P * n;
  const estimatedGains = Math.max(0, fv - investedAmount);

  return {
    investedAmount: Math.round(investedAmount),
    estimatedGains: Math.round(estimatedGains),
    futureValue: Math.round(fv),
  };
}

/**
 * 4. Step-Up / Increasing SIP Compounding Math
 * Reflects annual salary/income growth.
 * Contribution increases by stepUpRatePct at the start of each year.
 */
export function calculateStepUpSIP(
  initialMonthlySIP: number,
  annualRatePct: number,
  years: number,
  annualSalaryGrowthPct: number = 0
): {
  totalInvested: number;
  estimatedGains: number;
  futureValue: number;
  yearlyContributions: { year: number; monthlyAmount: number; totalYearInvested: number; cumulativeValue: number }[];
} {
  const P0 = Math.max(0, initialMonthlySIP);
  const totalYears = Math.max(0, Math.round(years));
  const stepRate = Math.max(0, annualSalaryGrowthPct) / 100;

  if (P0 === 0 || totalYears === 0) {
    return { totalInvested: 0, estimatedGains: 0, futureValue: 0, yearlyContributions: [] };
  }

  const effectiveMonthlyRate =
    annualRatePct === 0 ? 0 : Math.pow(1 + annualRatePct / 100, 1 / 12) - 1;

  let runningPortfolioValue = 0;
  let runningInvested = 0;
  const yearlyContributions = [];

  for (let y = 1; y <= totalYears; y++) {
    // Current year's monthly SIP amount
    const monthlyAmount = P0 * Math.pow(1 + stepRate, y - 1);
    const totalYearInvested = monthlyAmount * 12;

    // Compound existing portfolio from previous year over 12 months
    const compoundedPrevious =
      annualRatePct === 0
        ? runningPortfolioValue
        : runningPortfolioValue * Math.pow(1 + effectiveMonthlyRate, 12);

    // FV of 12 monthly contributions made during this year at year-end
    let fvNewContributions = 0;
    if (effectiveMonthlyRate === 0) {
      fvNewContributions = monthlyAmount * 12;
    } else {
      fvNewContributions =
        monthlyAmount * ((Math.pow(1 + effectiveMonthlyRate, 12) - 1) / effectiveMonthlyRate);
    }

    runningPortfolioValue = compoundedPrevious + fvNewContributions;
    runningInvested += totalYearInvested;

    yearlyContributions.push({
      year: y,
      monthlyAmount: Math.round(monthlyAmount),
      totalYearInvested: Math.round(totalYearInvested),
      cumulativeValue: Math.round(runningPortfolioValue),
    });
  }

  const totalInvested = Math.round(runningInvested);
  const futureValue = Math.round(runningPortfolioValue);
  const estimatedGains = Math.max(0, futureValue - totalInvested);

  return {
    totalInvested,
    estimatedGains,
    futureValue,
    yearlyContributions,
  };
}

/**
 * 5. Compound Interest / Lump Sum Math
 * FV = Principal * (1 + annualRate / 100)^years
 */
export function calculateCompoundInterest(
  principal: number,
  annualRatePct: number,
  years: number
): {
  principal: number;
  estimatedGrowth: number;
  futureValue: number;
  growthPct: number;
} {
  const P = Math.max(0, principal);
  const y = Math.max(0, years);

  if (P === 0 || y === 0) {
    return { principal: P, estimatedGrowth: 0, futureValue: P, growthPct: 0 };
  }

  const fv = P * Math.pow(1 + annualRatePct / 100, y);
  const growth = Math.max(0, fv - P);
  const growthPct = P > 0 ? (growth / P) * 100 : 0;

  return {
    principal: Math.round(P),
    estimatedGrowth: Math.round(growth),
    futureValue: Math.round(fv),
    growthPct: Number(growthPct.toFixed(2)),
  };
}

/**
 * 6. CAGR Calculator
 * CAGR = ((Final Value / Initial Value) ^ (1 / Number of Years) - 1) * 100
 */
export function calculateCAGR(
  initialValue: number,
  finalValue: number,
  years: number
): {
  cagrPct: number | null;
  absoluteGain: number;
  totalGainPct: number;
  isValid: boolean;
  errorMessage?: string;
} {
  if (initialValue <= 0) {
    return {
      cagrPct: null,
      absoluteGain: finalValue - initialValue,
      totalGainPct: 0,
      isValid: false,
      errorMessage: 'Initial investment must be strictly greater than zero.',
    };
  }

  if (years <= 0) {
    return {
      cagrPct: null,
      absoluteGain: finalValue - initialValue,
      totalGainPct: 0,
      isValid: false,
      errorMessage: 'Investment duration must be positive and greater than 0 years.',
    };
  }

  if (finalValue < 0) {
    return {
      cagrPct: null,
      absoluteGain: finalValue - initialValue,
      totalGainPct: 0,
      isValid: false,
      errorMessage: 'Final portfolio value cannot be negative.',
    };
  }

  const absoluteGain = finalValue - initialValue;
  const totalGainPct = (absoluteGain / initialValue) * 100;

  if (finalValue === 0) {
    return {
      cagrPct: -100,
      absoluteGain,
      totalGainPct: -100,
      isValid: true,
    };
  }

  const cagr = (Math.pow(finalValue / initialValue, 1 / years) - 1) * 100;

  return {
    cagrPct: Number(cagr.toFixed(2)),
    absoluteGain: Math.round(absoluteGain),
    totalGainPct: Number(totalGainPct.toFixed(2)),
    isValid: true,
  };
}

/**
 * 7. Inflation-Adjusted Purchasing Power
 * Real Value = Nominal Value / (1 + inflationRate / 100)^years
 */
export function calculateInflationAdjustedValue(
  nominalValue: number,
  inflationRatePct: number = 5.0,
  years: number
): number {
  if (years <= 0) return nominalValue;
  const divisor = Math.pow(1 + inflationRatePct / 100, years);
  return Math.round(nominalValue / divisor);
}

/**
 * 8. Goal-Based Target SIP Planner
 * Required Monthly Contribution to reach targetAmount in years at annualRatePct
 * P = targetAmount * i / ((1 + i)^n - 1)
 */
export function calculateGoalSIP(
  targetAmount: number,
  years: number,
  annualRatePct: number = 10.0
): {
  requiredMonthlySIP: number;
  totalInvestment: number;
  projectedGains: number;
  targetAmount: number;
} {
  const target = Math.max(0, targetAmount);
  const n = Math.max(1, Math.round(years * 12));

  if (target === 0) {
    return { requiredMonthlySIP: 0, totalInvestment: 0, projectedGains: 0, targetAmount: 0 };
  }

  if (annualRatePct === 0) {
    const required = target / n;
    return {
      requiredMonthlySIP: Math.round(required),
      totalInvestment: target,
      projectedGains: 0,
      targetAmount: target,
    };
  }

  const i = Math.pow(1 + annualRatePct / 100, 1 / 12) - 1;
  const requiredSIP = (target * i) / (Math.pow(1 + i, n) - 1);
  const totalInvestment = Math.round(requiredSIP * n);
  const projectedGains = Math.max(0, target - totalInvestment);

  return {
    requiredMonthlySIP: Math.round(requiredSIP),
    totalInvestment,
    projectedGains,
    targetAmount: target,
  };
}

/**
 * 9. Comprehensive Portfolio Projection Engine
 * Computes multi-asset category growth year by year with optional salary growth step-up
 * and inflation adjustment.
 */
export function generatePortfolioProjections(
  profile: UserFinancialProfile,
  allocation: PortfolioAllocation,
  scenario: ScenarioType = 'moderate',
  enableSalaryStepUp: boolean = true,
  annualInflationRate: number = 5.0
): PortfolioProjectionSummary {
  const years = Math.max(1, profile.investmentHorizonYears);
  const salaryGrowthPct = enableSalaryStepUp ? profile.expectedSalaryGrowth : 0;
  const rates = SCENARIO_RETURN_RATES[scenario];

  // Map asset items
  const equityMF = allocation.items.find((i) => i.id === 'equity-mf');
  const debtMF = allocation.items.find((i) => i.id === 'debt-mf');
  const stocks = allocation.items.find((i) => i.id === 'stocks');
  const gold = allocation.items.find((i) => i.id === 'gold');
  const cash = allocation.items.find((i) => i.id === 'cash-liquid');

  const stocksRate = rates.stocks;
  const equityMFRate = rates.equityMutualFunds;
  const debtMFRate = rates.debtMutualFunds;
  const goldRate = rates.gold;
  const cashRate = rates.emergencyCash;

  // Blended mutual funds rate
  const mfTotalMonthly = (equityMF?.monthlyAmount || 0) + (debtMF?.monthlyAmount || 0);
  const mfBlendedRate =
    mfTotalMonthly > 0
      ? ((equityMF?.monthlyAmount || 0) * equityMFRate + (debtMF?.monthlyAmount || 0) * debtMFRate) /
        mfTotalMonthly
      : (equityMFRate + debtMFRate) / 2;

  const yearlyData: YearProjectionPoint[] = [];

  let runningStocksVal = stocks?.lumpSumAmount || 0;
  let runningStocksInvested = stocks?.lumpSumAmount || 0;

  let runningMFVal = (equityMF?.lumpSumAmount || 0) + (debtMF?.lumpSumAmount || 0);
  let runningMFInvested = runningMFVal;

  let runningGoldVal = gold?.lumpSumAmount || 0;
  let runningGoldInvested = gold?.lumpSumAmount || 0;

  let runningCashVal = cash?.lumpSumAmount || 0;
  let runningCashInvested = runningCashVal;

  // Push Year 0 baseline
  const baselineTotalInvested =
    runningStocksInvested + runningMFInvested + runningGoldInvested + runningCashInvested;
  const baselineTotalValue = baselineTotalInvested;

  yearlyData.push({
    year: 0,
    label: 'Start (Today)',
    monthlySIPAmount: allocation.totalMonthlyAllocated,
    stocksInvested: Math.round(runningStocksInvested),
    stocksValue: Math.round(runningStocksVal),
    mutualFundsInvested: Math.round(runningMFInvested),
    mutualFundsValue: Math.round(runningMFVal),
    goldInvested: Math.round(runningGoldInvested),
    goldValue: Math.round(runningGoldVal),
    cashInvested: Math.round(runningCashInvested),
    cashValue: Math.round(runningCashVal),
    totalInvested: Math.round(baselineTotalInvested),
    totalPortfolioValue: Math.round(baselineTotalValue),
    realPurchasingPower: Math.round(baselineTotalValue),
    estimatedGrowth: 0,
  });

  for (let y = 1; y <= years; y++) {
    // Current year monthly SIP multiplier
    const stepFactor = Math.pow(1 + salaryGrowthPct / 100, y - 1);

    const stocksSIP = (stocks?.monthlyAmount || 0) * stepFactor;
    const equityMFSIP = (equityMF?.monthlyAmount || 0) * stepFactor;
    const debtMFSIP = (debtMF?.monthlyAmount || 0) * stepFactor;
    const mfSIP = equityMFSIP + debtMFSIP;
    const goldSIP = (gold?.monthlyAmount || 0) * stepFactor;
    const cashSIP = (cash?.monthlyAmount || 0) * stepFactor;

    // Helper for 1 year growth
    const compoundCategory = (
      currentVal: number,
      monthlySIP: number,
      annualRate: number
    ): { newVal: number; addedInvestment: number } => {
      const addedInvestment = monthlySIP * 12;
      const effectiveMonthly =
        annualRate === 0 ? 0 : Math.pow(1 + annualRate / 100, 1 / 12) - 1;

      const compoundedPrincipal =
        annualRate === 0 ? currentVal : currentVal * Math.pow(1 + effectiveMonthly, 12);

      let fvMonthly = 0;
      if (effectiveMonthly === 0) {
        fvMonthly = monthlySIP * 12;
      } else {
        fvMonthly = monthlySIP * ((Math.pow(1 + effectiveMonthly, 12) - 1) / effectiveMonthly);
      }

      return {
        newVal: compoundedPrincipal + fvMonthly,
        addedInvestment,
      };
    };

    const sRes = compoundCategory(runningStocksVal, stocksSIP, stocksRate);
    runningStocksVal = sRes.newVal;
    runningStocksInvested += sRes.addedInvestment;

    const mfRes = compoundCategory(runningMFVal, mfSIP, mfBlendedRate);
    runningMFVal = mfRes.newVal;
    runningMFInvested += mfRes.addedInvestment;

    const gRes = compoundCategory(runningGoldVal, goldSIP, goldRate);
    runningGoldVal = gRes.newVal;
    runningGoldInvested += gRes.addedInvestment;

    const cRes = compoundCategory(runningCashVal, cashSIP, cashRate);
    runningCashVal = cRes.newVal;
    runningCashInvested += cRes.addedInvestment;

    const totalInvested =
      runningStocksInvested + runningMFInvested + runningGoldInvested + runningCashInvested;
    const totalPortfolioValue =
      runningStocksVal + runningMFVal + runningGoldVal + runningCashVal;
    const estimatedGrowth = Math.max(0, totalPortfolioValue - totalInvested);

    const realPurchasingPower = calculateInflationAdjustedValue(
      totalPortfolioValue,
      annualInflationRate,
      y
    );

    yearlyData.push({
      year: y,
      label: `Yr ${y}`,
      monthlySIPAmount: Math.round(allocation.totalMonthlyAllocated * stepFactor),
      stocksInvested: Math.round(runningStocksInvested),
      stocksValue: Math.round(runningStocksVal),
      mutualFundsInvested: Math.round(runningMFInvested),
      mutualFundsValue: Math.round(runningMFVal),
      goldInvested: Math.round(runningGoldInvested),
      goldValue: Math.round(runningGoldVal),
      cashInvested: Math.round(runningCashInvested),
      cashValue: Math.round(runningCashVal),
      totalInvested: Math.round(totalInvested),
      totalPortfolioValue: Math.round(totalPortfolioValue),
      realPurchasingPower: Math.round(realPurchasingPower),
      estimatedGrowth: Math.round(estimatedGrowth),
    });
  }

  const finalPoint = yearlyData[yearlyData.length - 1];

  // Compute weighted assumed return
  const totalAllocMonthly = allocation.totalMonthlyAllocated;
  let assumedWeightedReturnPct = 10.0;
  if (totalAllocMonthly > 0) {
    let weightedSum = 0;
    allocation.items.forEach((it) => {
      weightedSum += (it.monthlyAmount / totalAllocMonthly) * it.assumedAnnualReturn;
    });
    assumedWeightedReturnPct = Number(weightedSum.toFixed(1));
  }

  return {
    scenario,
    horizonYears: years,
    annualInflationRate,
    hasSalaryGrowthStepUp: enableSalaryStepUp && profile.expectedSalaryGrowth > 0,
    totalInvested: finalPoint.totalInvested,
    estimatedGains: finalPoint.estimatedGrowth,
    finalNominalValue: finalPoint.totalPortfolioValue,
    finalRealValue: finalPoint.realPurchasingPower,
    assumedWeightedReturnPct,
    yearlyData,
  };
}

/**
 * Currency and Number Formatting Helpers for Indian Rupee
 */
export function formatINR(amount: number | null | undefined, compact: boolean = false): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '₹0';
  }

  if (compact) {
    const abs = Math.abs(amount);
    const sign = amount < 0 ? '-' : '';
    if (abs >= 10000000) {
      return `${sign}₹${(abs / 10000000).toFixed(2)} Cr`;
    }
    if (abs >= 100000) {
      return `${sign}₹${(abs / 100000).toFixed(2)} L`;
    }
    if (abs >= 1000) {
      return `${sign}₹${(abs / 1000).toFixed(1)} K`;
    }
    return `${sign}₹${Math.round(abs)}`;
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * FEATURE 1 & 2: Goal-Based Financial Planner & Explainable Recommendations Engine
 */

export interface UserGoal {
  id: string;
  name: string;
  category:
    | 'Emergency Cushion'
    | 'Higher Education'
    | 'Home Down Payment'
    | 'Vehicle / Tech'
    | 'Travel / Vacation'
    | 'Long-term Wealth'
    | 'Wedding / Family'
    | 'Other';
  targetAmount: number;
  currentSaved: number;
  targetDate: string; // YYYY-MM
  priority?: 'High' | 'Medium' | 'Low';
  description?: string;
  assumedReturnRate?: number; // e.g. 0% (cash), 6.5% (debt/FD), 10% (growth)
  createdAt: string;
}

export interface GoalCalculationResult {
  remainingAmount: number;
  remainingMonths: number;
  progressPct: number;
  requiredMonthlySavingsZeroReturn: number;
  requiredMonthlySavingsWithReturn: number;
  assumedAnnualReturn: number;
  isAchieved: boolean;
  isPastDeadline: boolean;
  isFeasibleWithSurplus: boolean;
  shortfallPerMonth: number;
  alternativeNewDeadlineMonths: number;
  alternativeAdjustedTarget: number;
}

export interface AggregateGoalsSummary {
  totalTargetAmount: number;
  totalCurrentSaved: number;
  totalRemainingAmount: number;
  totalRequiredMonthlyZeroReturn: number;
  totalRequiredMonthlyWithReturn: number;
  activeGoalsCount: number;
  completedGoalsCount: number;
  isAggregateFeasible: boolean;
  surplusDeficitOrSurplus: number;
}

export interface ExplainableRecommendation {
  id: string;
  title: string;
  category: 'Cash Flow' | 'Emergency Buffer' | 'Asset Allocation' | 'Debt Management' | 'Goal Planning';
  recommendation: string;
  reason: string;
  supportingNumbers: { label: string; value: string }[];
  calculationBreakdown: {
    formula: string;
    inputs: string;
    result: string;
    explanation: string;
  };
  risksAndLimitations: string;
  nextAction: string;
  severity: 'positive' | 'warning' | 'info';
}

/**
 * Calculates deadline months remaining from current date to target date (YYYY-MM)
 */
export function calculateMonthsRemaining(targetDateStr: string, referenceDate: Date = new Date()): number {
  if (!targetDateStr) return 0;
  try {
    const parts = targetDateStr.split('-');
    const targetYear = parseInt(parts[0], 10);
    const targetMonth = parseInt(parts[1], 10); // 1-indexed

    if (isNaN(targetYear) || isNaN(targetMonth)) return 0;

    const currentYear = referenceDate.getFullYear();
    const currentMonth = referenceDate.getMonth() + 1; // 1-indexed

    const diffMonths = (targetYear - currentYear) * 12 + (targetMonth - currentMonth);
    return diffMonths;
  } catch {
    return 0;
  }
}

/**
 * Calculates individual goal metrics, zero-return baseline, investment compounding,
 * feasibility against surplus, and realistic fallback adjustments.
 */
export function calculateGoalPlan(goal: UserGoal, userMonthlySurplus: number): GoalCalculationResult {
  const safeTarget = Math.max(0, goal.targetAmount);
  const safeSaved = Math.max(0, goal.currentSaved);
  const remainingAmount = Math.max(0, safeTarget - safeSaved);
  const isAchieved = safeTarget > 0 && remainingAmount === 0;

  const remainingMonths = calculateMonthsRemaining(goal.targetDate);
  const isPastDeadline = remainingMonths < 0;
  const effectiveMonths = Math.max(0, remainingMonths);

  const progressPct = safeTarget > 0 ? Math.min(100, Math.round((safeSaved / safeTarget) * 100)) : 100;

  // 1. Zero-Return Baseline Monthly Contribution
  let requiredMonthlySavingsZeroReturn = 0;
  if (!isAchieved) {
    if (effectiveMonths === 0) {
      requiredMonthlySavingsZeroReturn = remainingAmount;
    } else {
      requiredMonthlySavingsZeroReturn = Math.ceil(remainingAmount / effectiveMonths);
    }
  }

  // 2. Monthly Contribution with Assumed Annual Return (compounded monthly)
  const assumedAnnualReturn = goal.assumedReturnRate ?? 0;
  let requiredMonthlySavingsWithReturn = requiredMonthlySavingsZeroReturn;

  if (!isAchieved && assumedAnnualReturn > 0 && effectiveMonths > 1) {
    const i = Math.pow(1 + assumedAnnualReturn / 100, 1 / 12) - 1;
    const n = effectiveMonths;
    if (i > 0) {
      const p = (remainingAmount * i) / (Math.pow(1 + i, n) - 1);
      requiredMonthlySavingsWithReturn = Math.max(0, Math.ceil(p));
    }
  }

  // 3. Feasibility against User's Monthly Surplus
  const isDeficitSurplus = userMonthlySurplus <= 0;
  const isFeasibleWithSurplus =
    isAchieved ||
    (!isDeficitSurplus && requiredMonthlySavingsZeroReturn <= userMonthlySurplus);

  const shortfallPerMonth = isFeasibleWithSurplus
    ? 0
    : Math.max(0, requiredMonthlySavingsZeroReturn - Math.max(0, userMonthlySurplus));

  // 4. Realistic Alternative Adjustments
  // Alternative deadline: how many months if investing full available surplus?
  const alternativeNewDeadlineMonths =
    userMonthlySurplus > 0 ? Math.ceil(remainingAmount / userMonthlySurplus) : 0;

  // Alternative target: what target can be saved in current timeline with current surplus?
  const alternativeAdjustedTarget =
    safeSaved + Math.max(0, userMonthlySurplus) * Math.max(1, effectiveMonths);

  return {
    remainingAmount,
    remainingMonths: effectiveMonths,
    progressPct,
    requiredMonthlySavingsZeroReturn,
    requiredMonthlySavingsWithReturn,
    assumedAnnualReturn,
    isAchieved,
    isPastDeadline,
    isFeasibleWithSurplus,
    shortfallPerMonth,
    alternativeNewDeadlineMonths,
    alternativeAdjustedTarget,
  };
}

/**
 * Aggregates all goals, tracking total planned contributions and comparing to monthly savings capacity.
 */
export function calculateAggregateGoalsSummary(
  goals: UserGoal[],
  userMonthlySurplus: number
): AggregateGoalsSummary {
  let totalTargetAmount = 0;
  let totalCurrentSaved = 0;
  let totalRemainingAmount = 0;
  let totalRequiredMonthlyZeroReturn = 0;
  let totalRequiredMonthlyWithReturn = 0;
  let activeGoalsCount = 0;
  let completedGoalsCount = 0;

  goals.forEach((goal) => {
    const res = calculateGoalPlan(goal, userMonthlySurplus);
    totalTargetAmount += goal.targetAmount;
    totalCurrentSaved += goal.currentSaved;
    totalRemainingAmount += res.remainingAmount;

    if (res.isAchieved) {
      completedGoalsCount++;
    } else {
      activeGoalsCount++;
      totalRequiredMonthlyZeroReturn += res.requiredMonthlySavingsZeroReturn;
      totalRequiredMonthlyWithReturn += res.requiredMonthlySavingsWithReturn;
    }
  });

  const isAggregateFeasible =
    activeGoalsCount === 0 ||
    (userMonthlySurplus > 0 && totalRequiredMonthlyZeroReturn <= userMonthlySurplus);

  const surplusDeficitOrSurplus = userMonthlySurplus - totalRequiredMonthlyZeroReturn;

  return {
    totalTargetAmount,
    totalCurrentSaved,
    totalRemainingAmount,
    totalRequiredMonthlyZeroReturn,
    totalRequiredMonthlyWithReturn,
    activeGoalsCount,
    completedGoalsCount,
    isAggregateFeasible,
    surplusDeficitOrSurplus,
  };
}

/**
 * Deterministic Explainable AI Recommendations Engine.
 * Generates transparent justifications with exact supporting numbers, formula breakdown,
 * risks/limitations, and concrete next actions.
 */
export function generateExplainableRecommendations(
  profile: UserFinancialProfile,
  health: FinancialHealthMetrics,
  allocation: PortfolioAllocation,
  goals: UserGoal[] = []
): ExplainableRecommendation[] {
  const recommendations: ExplainableRecommendation[] = [];

  // 1. Cash Flow & Monthly Surplus Recommendation
  if (health.isDeficit) {
    recommendations.push({
      id: 'rec-cashflow-deficit',
      title: 'Halt New Market Investments & Close Outflow Deficit',
      category: 'Cash Flow',
      recommendation:
        'Pause recurring market investments immediately and conduct a line-item expense reduction to balance monthly cash flow.',
      reason:
        `Your monthly living commitments and loan EMIs exceed your monthly in-hand income by ${formatINR(Math.abs(health.monthlySurplus))}. Investing in stocks or mutual funds with borrowed funds or a negative cash flow increases the risk of distress selling during market downturns.`,
      supportingNumbers: [
        { label: 'Monthly Income', value: formatINR(profile.monthlyIncome) },
        { label: 'Monthly Expenses', value: formatINR(profile.monthlyExpenses) },
        { label: 'Monthly Debt EMI', value: formatINR(profile.monthlyEMI) },
        { label: 'Monthly Shortfall', value: `−${formatINR(Math.abs(health.monthlySurplus))}` },
      ],
      calculationBreakdown: {
        formula: 'Monthly Surplus = Monthly Income − (Monthly Expenses + Monthly EMI)',
        inputs: `${formatINR(profile.monthlyIncome)} − (${formatINR(profile.monthlyExpenses)} + ${formatINR(profile.monthlyEMI)})`,
        result: `${formatINR(health.monthlySurplus)} (Outflow Deficit)`,
        explanation:
          'When the result is negative, every rupee invested must come from draining existing emergency reserves or accumulating high-interest debt.',
      },
      risksAndLimitations:
        'Failure to eliminate the deficit will deplete liquid savings within a few months, leaving no safety buffer for family emergencies or income shocks.',
      nextAction:
        `Review discretionary lifestyle spending to trim at least ${formatINR(Math.abs(health.monthlySurplus))} per month to return cash flow to positive.`,
      severity: 'warning',
    });
  } else {
    recommendations.push({
      id: 'rec-cashflow-healthy',
      title: 'Automate Monthly Savings of Surplus Capital',
      category: 'Cash Flow',
      recommendation:
        `Commit ${formatINR(health.monthlySurplus)} of your monthly investable surplus via automated debits scheduled immediately following payday.`,
      reason:
        `You currently maintain a positive savings rate of ${health.savingsRate ? health.savingsRate.toFixed(1) + '%' : 'N/A'}. Automating your transfers ensures you save first rather than saving only what remains at month-end.`,
      supportingNumbers: [
        { label: 'Monthly Income', value: formatINR(profile.monthlyIncome) },
        { label: 'Monthly Surplus', value: formatINR(health.monthlySurplus) },
        { label: 'Savings Rate', value: `${health.savingsRate ? health.savingsRate.toFixed(1) + '%' : 'N/A'}` },
        { label: 'Expense Ratio', value: `${health.expenseRatio ? health.expenseRatio.toFixed(1) + '%' : 'N/A'}` },
      ],
      calculationBreakdown: {
        formula: 'Savings Rate (%) = (Monthly Surplus / Monthly Income) × 100',
        inputs: `(${formatINR(health.monthlySurplus)} / ${formatINR(profile.monthlyIncome)}) × 100`,
        result: `${health.savingsRate ? health.savingsRate.toFixed(1) + '%' : 'N/A'}`,
        explanation:
          'A savings rate of 20% or higher is considered healthy for building long-term independence.',
      },
      risksAndLimitations:
        'Unexpected quarterly or annual expenses (like vehicle insurance or festival spending) can temporarily compress monthly surplus.',
      nextAction:
        'Set up auto-debits for the 3rd to 5th day of the month so surplus is invested before discretionary spending begins.',
      severity: 'positive',
    });
  }

  // 2. Emergency Buffer Recommendation
  if (health.emergencyFundGap > 0) {
    recommendations.push({
      id: 'rec-emergency-gap',
      title: 'Prioritize Building Your 6-Month Liquid Safety Cushion',
      category: 'Emergency Buffer',
      recommendation:
        `Direct available surplus towards completing your emergency buffer until you reach the target of ${formatINR(health.emergencyFundTarget6m)}.`,
      reason:
        `Your current liquid savings (${formatINR(profile.existingSavings)}) leave an emergency shortfall of ${formatINR(health.emergencyFundGap)}. Without this cushion, any unexpected medical bill or job hiatus could force you to liquidate long-term equity at a loss.`,
      supportingNumbers: [
        { label: 'Essential Monthly Costs', value: formatINR(health.essentialMonthlyExpenses) },
        { label: '6-Month Target Buffer', value: formatINR(health.emergencyFundTarget6m) },
        { label: 'Current Savings', value: formatINR(profile.existingSavings) },
        { label: 'Emergency Fund Gap', value: formatINR(health.emergencyFundGap) },
      ],
      calculationBreakdown: {
        formula: 'Emergency Gap = max(0, 6 × (Monthly Expenses + EMI) − Existing Savings)',
        inputs: `6 × (${formatINR(profile.monthlyExpenses)} + ${formatINR(profile.monthlyEMI)}) − ${formatINR(profile.existingSavings)}`,
        result: `${formatINR(health.emergencyFundGap)} shortfall`,
        explanation:
          'Six months of essential expenses provides safety without locking too much capital away from inflation-beating investments.',
      },
      risksAndLimitations:
        'Holding excess emergency funds in zero-interest checking accounts loses purchasing power to inflation over multiple years.',
      nextAction:
        'Keep emergency reserves in high-safety liquid mutual funds or sweep-in bank fixed deposits offering same-day liquidity.',
      severity: 'warning',
    });
  } else {
    recommendations.push({
      id: 'rec-emergency-funded',
      title: 'Emergency Buffer Fully Secured',
      category: 'Emergency Buffer',
      recommendation:
        'Maintain your current liquid reserves and direct ongoing monthly surplus entirely toward long-term wealth compounding.',
      reason:
        `Your liquid savings of ${formatINR(profile.existingSavings)} satisfy the recommended 6-month essential living buffer (${formatINR(health.emergencyFundTarget6m)}).`,
      supportingNumbers: [
        { label: 'Essential Monthly Costs', value: formatINR(health.essentialMonthlyExpenses) },
        { label: '6-Month Target', value: formatINR(health.emergencyFundTarget6m) },
        { label: 'Current Savings', value: formatINR(profile.existingSavings) },
      ],
      calculationBreakdown: {
        formula: 'Coverage Months = Existing Savings / (Monthly Expenses + Monthly EMI)',
        inputs: `${formatINR(profile.existingSavings)} / ${formatINR(health.essentialMonthlyExpenses)}`,
        result: `${(profile.existingSavings / Math.max(1, health.essentialMonthlyExpenses)).toFixed(1)} Months of Coverage`,
        explanation: 'Provides sufficient insulation against job loss, medical emergencies, or economic slowdowns.',
      },
      risksAndLimitations:
        'Emergency reserves must never be locked in equity funds, real estate, or long lock-in tax schemes (ELSS/PPF).',
      nextAction:
        'Review emergency fund balance once a year to adjust for lifestyle or inflation cost increases.',
      severity: 'positive',
    });
  }

  // 3. Asset Allocation Strategy Recommendation
  recommendations.push({
    id: 'rec-asset-allocation',
    title: `Calibrated ${profile.riskTolerance} Risk Portfolio Distribution`,
    category: 'Asset Allocation',
    recommendation:
      `Allocate monthly investable capital across Equity Funds (${allocation.items.find((i) => i.id === 'equity-mf')?.percentage || 0}%), Debt (${allocation.items.find((i) => i.id === 'debt-mf')?.percentage || 0}%), Gold (${allocation.items.find((i) => i.id === 'gold')?.percentage || 0}%), and Blue-Chip Stocks (${allocation.items.find((i) => i.id === 'stocks')?.percentage || 0}%).`,
    reason:
      `For your ${profile.riskTolerance.toLowerCase()} risk profile and ${profile.investmentHorizonYears}-year horizon, this distribution optimizes real returns while dampening portfolio drawdowns during market corrections.`,
    supportingNumbers: [
      { label: 'Risk Profile', value: profile.riskTolerance },
      { label: 'Investment Horizon', value: `${profile.investmentHorizonYears} Years` },
      { label: 'Monthly SIP Amount', value: formatINR(allocation.totalMonthlyAllocated) },
      { label: 'Primary Goal', value: profile.goal },
    ],
    calculationBreakdown: {
      formula: 'Category Monthly SIP = Total Investable Surplus × Allocation Percentage (%)',
      inputs: `${formatINR(allocation.totalMonthlyAllocated)} distributed across verified risk-weighted asset buckets`,
      result: `100% Total Allocation across 5 categories`,
      explanation:
        'Longer horizons (>5 years) allow equity compounding to overcome cyclical stock market pullbacks.',
    },
    risksAndLimitations:
      'Equity markets can experience temporary drawdowns of 15% to 30% in bear cycles. Returns are simulation assumptions, not guaranteed yields.',
    nextAction:
      'Begin by setting up automated SIPs in low-cost broad index or flexi-cap mutual funds before picking individual stocks.',
    severity: 'info',
  });

  // 4. Debt & Loan Burden Recommendation (if EMI > 0)
  if (profile.monthlyEMI > 0) {
    const isEmiHeavy = (health.emiRatio || 0) > 35;
    recommendations.push({
      id: 'rec-debt-management',
      title: isEmiHeavy ? 'High Debt Burden: Prioritize Loan Prepayment' : 'Debt Obligations Within Safe Benchmark',
      category: 'Debt Management',
      recommendation: isEmiHeavy
        ? 'Consider allocating surplus to prepay high-interest loans before aggressively scaling equity investments.'
        : 'Maintain timely EMI payments while continuing your scheduled monthly investment contributions.',
      reason:
        `Your loan EMIs consume ${health.emiRatio ? health.emiRatio.toFixed(1) + '%' : '0%'} of your monthly income. Financial standards recommend keeping total debt repayment commitments under 35%.`,
      supportingNumbers: [
        { label: 'Monthly Income', value: formatINR(profile.monthlyIncome) },
        { label: 'Monthly EMI', value: formatINR(profile.monthlyEMI) },
        { label: 'EMI Burden Ratio', value: `${health.emiRatio ? health.emiRatio.toFixed(1) + '%' : '0%'}` },
        { label: 'Safe Benchmark', value: 'Under 35%' },
      ],
      calculationBreakdown: {
        formula: 'EMI-to-Income Ratio (%) = (Monthly EMI / Monthly Income) × 100',
        inputs: `(${formatINR(profile.monthlyEMI)} / ${formatINR(profile.monthlyIncome)}) × 100`,
        result: `${health.emiRatio ? health.emiRatio.toFixed(1) + '%' : '0%'}`,
        explanation:
          'When debt exceeds 35-40% of income, financial flexibility is restricted and interest drag erodes compounding.',
      },
      risksAndLimitations:
        'Prepayment may incur charges on certain fixed-rate personal loans; check loan terms before making lump sum principal prepayments.',
      nextAction: isEmiHeavy
        ? 'List existing loans by interest rate and target the highest-cost loan (credit cards or personal loans) first.'
        : 'Continue automated bank payments to protect your credit score.',
      severity: isEmiHeavy ? 'warning' : 'positive',
    });
  }

  // 5. Goal Planning Recommendation (if user has active goals)
  if (goals.length > 0) {
    const agg = calculateAggregateGoalsSummary(goals, health.monthlySurplus);
    if (!agg.isAggregateFeasible) {
      recommendations.push({
        id: 'rec-goals-shortfall',
        title: 'Active Goals Exceed Monthly Savings Capacity',
        category: 'Goal Planning',
        recommendation:
          'Re-align your goal timelines or target amounts to prevent spreading your savings too thin.',
        reason:
          `Your active goals collectively require ${formatINR(agg.totalRequiredMonthlyZeroReturn)} / month, but your current investable surplus is ${formatINR(health.monthlySurplus)} / month (a monthly deficit of ${formatINR(Math.abs(agg.surplusDeficitOrSurplus))}).`,
        supportingNumbers: [
          { label: 'Active Goals', value: `${agg.activeGoalsCount}` },
          { label: 'Total Required / Month', value: formatINR(agg.totalRequiredMonthlyZeroReturn) },
          { label: 'Available Surplus', value: formatINR(health.monthlySurplus) },
          { label: 'Monthly Shortfall', value: formatINR(Math.abs(agg.surplusDeficitOrSurplus)) },
        ],
        calculationBreakdown: {
          formula: 'Goals Capacity Gap = Available Monthly Surplus − Total Required Monthly Goal Savings',
          inputs: `${formatINR(health.monthlySurplus)} − ${formatINR(agg.totalRequiredMonthlyZeroReturn)}`,
          result: `Deficit of ${formatINR(Math.abs(agg.surplusDeficitOrSurplus))} / month`,
          explanation:
            'When planned goal contributions exceed monthly surplus, goals risk being abandoned or underfunded.',
        },
        risksAndLimitations:
          'Pursuing too many short-term goals simultaneously sacrifices long-term compound growth for retirement.',
        nextAction:
          'Use the Goal Planner to either extend the target deadline by a few months or prioritize high-impact goals first.',
        severity: 'warning',
      });
    }
  }

  return recommendations;
}
