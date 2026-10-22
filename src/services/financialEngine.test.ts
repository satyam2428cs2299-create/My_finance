/**
 * Automated Unit Test Suite for Financial Mathematics Engine
 * Verifies edge cases, mathematical formulas, boundary conditions, and rounding precision.
 */

import {
  calculateCAGR,
  calculateCompoundInterest,
  calculateFinancialHealth,
  calculateGoalSIP,
  calculateInflationAdjustedValue,
  calculateSIP,
  calculateStepUpSIP,
  formatINR,
  generatePortfolioAllocation,
  generatePortfolioProjections,
  calculateMonthsRemaining,
  calculateGoalPlan,
  calculateAggregateGoalsSummary,
  generateExplainableRecommendations,
  UserGoal,
  UserFinancialProfile,
} from './financialEngine';

export interface TestResult {
  name: string;
  passed: boolean;
  actual: any;
  expected: any;
  message?: string;
}

export function runFinancialEngineTests(): {
  total: number;
  passed: number;
  failed: number;
  results: TestResult[];
} {
  const results: TestResult[] = [];

  const assert = (name: string, condition: boolean, actual: any, expected: any, message?: string) => {
    results.push({
      name,
      passed: Boolean(condition),
      actual,
      expected,
      message,
    });
  };

  // 1. Zero Monthly Return SIP
  {
    const res = calculateSIP(5000, 0, 5);
    const expectedInvested = 5000 * 12 * 5; // 300,000
    assert(
      'SIP: Zero annual return produces FV equal to total contributions',
      res.futureValue === expectedInvested && res.estimatedGains === 0,
      res.futureValue,
      expectedInvested
    );
  }

  // 2. Zero Monthly Contribution
  {
    const res = calculateSIP(0, 12, 10);
    assert(
      'SIP: Zero monthly contribution yields zero FV and zero gains',
      res.futureValue === 0 && res.investedAmount === 0,
      res.futureValue,
      0
    );
  }

  // 3. Zero Income Handling
  {
    const health = calculateFinancialHealth(0, 20000, 5000, 50000);
    assert(
      'Health: Zero income marks savingsRate as null and status as critical',
      health.savingsRate === null && health.isDeficit && health.status === 'critical',
      { savingsRate: health.savingsRate, status: health.status },
      { savingsRate: null, status: 'critical' }
    );
  }

  // 4. Zero Expenses
  {
    const health = calculateFinancialHealth(100000, 0, 0, 100000);
    assert(
      'Health: Zero expenses yields 100% savings rate',
      health.savingsRate === 100 && health.monthlySurplus === 100000,
      health.savingsRate,
      100
    );
  }

  // 5. Negative Monthly Surplus (Cash Flow Deficit)
  {
    const health = calculateFinancialHealth(50000, 45000, 15000, 10000);
    assert(
      'Health: Negative monthly surplus detected properly',
      health.monthlySurplus === -10000 && health.isDeficit,
      health.monthlySurplus,
      -10000
    );
  }

  // 6. Negative Cash Flow Prevents Positive Investment Recommendations
  {
    const dummyProfile: UserFinancialProfile = {
      age: 28,
      occupation: 'Salaried Employee',
      knowledgeLevel: 'Intermediate',
      dependents: 1,
      goal: 'Wealth Growth',
      monthlyIncome: 40000,
      monthlyExpenses: 35000,
      monthlyEMI: 10000,
      existingSavings: 20000,
      riskTolerance: 'High',
      expectedSalaryGrowth: 10,
      investmentHorizonYears: 10,
    };
    const health = calculateFinancialHealth(40000, 35000, 10000, 20000);
    const alloc = generatePortfolioAllocation(dummyProfile, health);
    assert(
      'Allocation: Deficit cash-flow enforces ₹0 recurring investment allocation',
      alloc.totalMonthlyAllocated === 0 && Boolean(alloc.warningNotice),
      alloc.totalMonthlyAllocated,
      0
    );
  }

  // 7. Initial Investment Equal to Zero (Compound Interest)
  {
    const res = calculateCompoundInterest(0, 12, 10);
    assert(
      'Compound Interest: Zero principal returns zero future value',
      res.futureValue === 0 && res.estimatedGrowth === 0,
      res.futureValue,
      0
    );
  }

  // 8. Zero-Duration CAGR
  {
    const res = calculateCAGR(10000, 20000, 0);
    assert(
      'CAGR: Zero duration is rejected with isValid=false',
      res.isValid === false && res.cagrPct === null,
      res.isValid,
      false
    );
  }

  // 9. Final Value Below Initial Value (Negative CAGR / Loss)
  {
    const res = calculateCAGR(100000, 70000, 3);
    assert(
      'CAGR: Negative returns yield negative CAGR and correct loss calculation',
      res.isValid === true && (res.cagrPct ?? 0) < 0 && res.absoluteGain === -30000,
      res.absoluteGain,
      -30000
    );
  }

  // 10. Final Value Equal to Zero (Complete Loss)
  {
    const res = calculateCAGR(50000, 0, 5);
    assert(
      'CAGR: Final value 0 yields -100% CAGR',
      res.isValid === true && res.cagrPct === -100,
      res.cagrPct,
      -100
    );
  }

  // 11. Very Long Investment Durations (e.g. 40 years)
  {
    const res = calculateSIP(10000, 12, 40);
    assert(
      'SIP: Long duration (40 years) executes without overflow or NaN',
      !isNaN(res.futureValue) && isFinite(res.futureValue) && res.futureValue > 50000000,
      res.futureValue > 50000000,
      true
    );
  }

  // 12. Decimal Percentage Inputs (e.g. 12.5%, 6.75%)
  {
    const res = calculateSIP(10000, 12.5, 5);
    assert(
      'SIP: Handles decimal interest rates (12.5%) accurately',
      res.futureValue > 800000 && res.futureValue < 950000,
      res.futureValue > 800000,
      true
    );
  }

  // 13. Rounding and Currency Formatting
  {
    const formatted = formatINR(1500000, true);
    assert(
      'Currency: formatINR compact formats 15 Lakhs as ₹15.00 L',
      formatted === '₹15.00 L',
      formatted,
      '₹15.00 L'
    );
  }

  // 14. Portfolio Allocation Percentages strictly summing to 100%
  {
    const dummyProfile: UserFinancialProfile = {
      age: 32,
      occupation: 'Self-Employed',
      knowledgeLevel: 'Advanced',
      dependents: 2,
      goal: 'Retirement',
      monthlyIncome: 120000,
      monthlyExpenses: 50000,
      monthlyEMI: 10000,
      existingSavings: 400000,
      riskTolerance: 'Moderate',
      expectedSalaryGrowth: 8,
      investmentHorizonYears: 15,
    };
    const health = calculateFinancialHealth(120000, 50000, 10000, 400000);
    const alloc = generatePortfolioAllocation(dummyProfile, health);
    const sumPct = alloc.items.reduce((sum, item) => sum + item.percentage, 0);
    assert(
      'Allocation: Item percentages sum exactly to 100%',
      sumPct === 100,
      sumPct,
      100
    );
  }

  // 15. Step-Up SIP vs Constant SIP Comparison
  {
    const constantSIP = calculateSIP(10000, 12, 10);
    const stepUpSIP = calculateStepUpSIP(10000, 12, 10, 10); // 10% annual increase
    assert(
      'Step-Up SIP: Increasing contributions outgrow constant SIP',
      stepUpSIP.totalInvested > constantSIP.investedAmount &&
        stepUpSIP.futureValue > constantSIP.futureValue,
      stepUpSIP.futureValue > constantSIP.futureValue,
      true
    );
  }

  // 16. Existing Savings Excluded from Emergency Reserves
  {
    const dummyProfile: UserFinancialProfile = {
      age: 26,
      occupation: 'Salaried Employee',
      knowledgeLevel: 'Beginner',
      dependents: 0,
      goal: 'Wealth Growth',
      monthlyIncome: 80000,
      monthlyExpenses: 30000,
      monthlyEMI: 10000,
      existingSavings: 200000, // less than 6m target of 240,000
      riskTolerance: 'Moderate',
      expectedSalaryGrowth: 5,
      investmentHorizonYears: 5,
    };
    const health = calculateFinancialHealth(80000, 30000, 10000, 200000);
    const alloc = generatePortfolioAllocation(dummyProfile, health);
    // Because 200,000 is needed for emergency fund, investable lump sum must be 0
    assert(
      'Emergency Reserve: Existing savings under target are preserved for emergency buffer',
      alloc.emergencyReserveAllocated === 200000 && alloc.totalLumpSumAllocated === 0,
      { emergencyReserve: alloc.emergencyReserveAllocated, lumpSum: alloc.totalLumpSumAllocated },
      { emergencyReserve: 200000, lumpSum: 0 }
    );
  }

  // 17. Inflation Adjustment Test
  {
    const realVal = calculateInflationAdjustedValue(1000000, 5, 10);
    // 1000000 / (1.05^10) ~ 613913
    assert(
      'Inflation: Calculates purchasing power reduction over 10 years at 5%',
      realVal > 610000 && realVal < 620000,
      realVal,
      613913
    );
  }

  // 18. Goal SIP Solver
  {
    const goalRes = calculateGoalSIP(5000000, 10, 12);
    assert(
      'Goal SIP: Solves required monthly contribution for ₹50L target in 10 years',
      goalRes.requiredMonthlySIP > 20000 && goalRes.requiredMonthlySIP < 25000,
      goalRes.requiredMonthlySIP,
      21735
    );
  }

  // 19. Goal Planner: Deadline months remaining calculation
  {
    const refDate = new Date(2026, 9, 1); // Oct 2026
    const monthsAhead = calculateMonthsRemaining('2027-10', refDate);
    const monthsPast = calculateMonthsRemaining('2025-10', refDate);
    assert(
      'Goal Planner: Accurately calculates positive and negative month differences',
      monthsAhead === 12 && monthsPast === -12,
      { monthsAhead, monthsPast },
      { monthsAhead: 12, monthsPast: -12 }
    );
  }

  // 20. Goal Planner: Baseline zero-return monthly requirement
  {
    const dummyGoal: UserGoal = {
      id: 'test-g1',
      name: 'Tech Setup',
      category: 'Vehicle / Tech',
      targetAmount: 120000,
      currentSaved: 20000,
      targetDate: '2027-08',
      assumedReturnRate: 0,
      createdAt: '2026-01-01',
    };
    // 100,000 remaining; suppose target is 10 months away
    const plan = calculateGoalPlan(dummyGoal, 25000);
    assert(
      'Goal Planner: Baseline savings divides remaining amount by remaining months with no imaginary yield',
      plan.remainingAmount === 100000 && plan.progressPct === 17,
      { remainingAmount: plan.remainingAmount, progressPct: plan.progressPct },
      { remainingAmount: 100000, progressPct: 17 }
    );
  }

  // 21. Goal Planner: Feasibility check against user surplus and alternative calculations
  {
    const ambitiousGoal: UserGoal = {
      id: 'test-g2',
      name: 'Luxury Car Down Payment',
      category: 'Vehicle / Tech',
      targetAmount: 500000,
      currentSaved: 0,
      targetDate: '2027-04', // 6 months away
      assumedReturnRate: 0,
      createdAt: '2026-01-01',
    };
    // User surplus is only 20,000 / month; goal needs ~83,334 / month
    const plan = calculateGoalPlan(ambitiousGoal, 20000);
    assert(
      'Goal Planner: Flags infeasible goal when required savings exceed surplus and provides alternatives',
      plan.isFeasibleWithSurplus === false &&
        plan.shortfallPerMonth > 0 &&
        plan.alternativeNewDeadlineMonths > 0 &&
        plan.alternativeAdjustedTarget > 0,
      { isFeasible: plan.isFeasibleWithSurplus, shortfall: plan.shortfallPerMonth },
      { isFeasible: false, shortfall: '>0' }
    );
  }

  // 22. Goal Planner: Aggregate goals capacity tracking
  {
    const goalList: UserGoal[] = [
      {
        id: 'g-a',
        name: 'Goal A',
        category: 'Emergency Cushion',
        targetAmount: 100000,
        currentSaved: 100000, // completed
        targetDate: '2026-12',
        createdAt: '2026-01-01',
      },
      {
        id: 'g-b',
        name: 'Goal B',
        category: 'Higher Education',
        targetAmount: 200000,
        currentSaved: 50000,
        targetDate: '2027-10', // active
        createdAt: '2026-01-01',
      },
    ];
    const agg = calculateAggregateGoalsSummary(goalList, 30000);
    assert(
      'Goal Planner: Aggregate summary counts completed vs active goals and computes capacity correctly',
      agg.completedGoalsCount === 1 && agg.activeGoalsCount === 1 && agg.totalTargetAmount === 300000,
      { completed: agg.completedGoalsCount, active: agg.activeGoalsCount, target: agg.totalTargetAmount },
      { completed: 1, active: 1, target: 300000 }
    );
  }

  // 23. Explainable Recommendations: Structure and field completeness
  {
    const profile: UserFinancialProfile = {
      age: 28,
      occupation: 'Salaried Employee',
      knowledgeLevel: 'Intermediate',
      dependents: 0,
      goal: 'Wealth Growth',
      monthlyIncome: 100000,
      monthlyExpenses: 40000,
      monthlyEMI: 10000,
      existingSavings: 200000,
      riskTolerance: 'High',
      expectedSalaryGrowth: 10,
      investmentHorizonYears: 10,
    };
    const health = calculateFinancialHealth(100000, 40000, 10000, 200000);
    const alloc = generatePortfolioAllocation(profile, health);
    const recs = generateExplainableRecommendations(profile, health, alloc);

    const allHave6Components = recs.every(
      (r) =>
        r.recommendation.length > 0 &&
        r.reason.length > 0 &&
        r.supportingNumbers.length > 0 &&
        r.calculationBreakdown.formula.length > 0 &&
        r.calculationBreakdown.inputs.length > 0 &&
        r.calculationBreakdown.result.length > 0 &&
        r.risksAndLimitations.length > 0 &&
        r.nextAction.length > 0
    );

    assert(
      'Explainable AI: Every recommendation possesses all 6 required transparency components',
      recs.length >= 3 && allHave6Components,
      { recCount: recs.length, allHave6Components },
      { recCount: '>=3', allHave6Components: true }
    );
  }

  const passed = results.filter((r) => r.passed).length;
  const failed = results.length - passed;

  return {
    total: results.length,
    passed,
    failed,
    results,
  };
}
