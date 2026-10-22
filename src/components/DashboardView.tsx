import React, { useState } from 'react';
import {
  UserFinancialProfile,
  FinancialHealthMetrics,
  PortfolioAllocation,
  PortfolioProjectionSummary,
  UserGoal,
  ExplainableRecommendation,
  calculateFinancialHealth,
  generatePortfolioAllocation,
  generatePortfolioProjections,
  calculateAggregateGoalsSummary,
  generateExplainableRecommendations,
  calculateGoalPlan,
  formatINR,
  ScenarioType,
} from '../services/financialEngine';
import { useAuth } from '../context/AuthContext';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Area,
  AreaChart,
} from 'recharts';
import {
  Sliders,
  RefreshCw,
  Wallet,
  CreditCard,
  PiggyBank,
  TrendingUp,
  Shield,
  ShieldCheck,
  Compass,
  ArrowRight,
  Info,
  ChevronDown,
  ChevronUp,
  Target,
  Sparkles,
  Calculator,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
} from 'lucide-react';

interface DashboardViewProps {
  profile: UserFinancialProfile;
  onEditProfile: () => void;
  onNavigateToExplorer: () => void;
  onNavigateToGoals: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  profile,
  onEditProfile,
  onNavigateToExplorer,
  onNavigateToGoals,
}) => {
  const { user } = useAuth();

  // Dashboard configuration state
  const [scenario, setScenario] = useState<ScenarioType>('moderate');
  const [enableStepUp, setEnableStepUp] = useState<boolean>(profile.expectedSalaryGrowth > 0);
  const [showFormulaDetails, setShowFormulaDetails] = useState<boolean>(false);
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);

  // Gemini & Explainability State
  const [isLoadingGemini, setIsLoadingGemini] = useState<boolean>(false);
  const [geminiInsights, setGeminiInsights] = useState<any | null>(null);
  const [geminiStatus, setGeminiStatus] = useState<{ source?: string; notice?: string } | null>(null);
  const [expandedRecs, setExpandedRecs] = useState<Record<string, boolean>>({
    'rec-cashflow-healthy': true,
    'rec-cashflow-deficit': true,
    'rec-emergency-gap': true,
    'rec-asset-allocation': true,
  });

  const toggleRec = (id: string) => {
    setExpandedRecs((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Calculations
  const healthMetrics: FinancialHealthMetrics = calculateFinancialHealth(
    profile.monthlyIncome,
    profile.monthlyExpenses,
    profile.monthlyEMI,
    profile.existingSavings,
    6
  );

  const allocation: PortfolioAllocation = generatePortfolioAllocation(
    profile,
    healthMetrics,
    scenario
  );

  const projection: PortfolioProjectionSummary = generatePortfolioProjections(
    profile,
    allocation,
    scenario,
    enableStepUp,
    5.0
  );

  const handleRegenerate = () => {
    setIsRegenerating(true);
    setTimeout(() => {
      setIsRegenerating(false);
    }, 400);
  };

  const userGoals: UserGoal[] = user?.goals || [];
  const aggregateGoals = calculateAggregateGoalsSummary(userGoals, healthMetrics.monthlySurplus);
  const explainableRecs = generateExplainableRecommendations(
    profile,
    healthMetrics,
    allocation,
    userGoals
  );

  const fetchGeminiInsights = async () => {
    setIsLoadingGemini(true);
    try {
      const res = await fetch('/api/gemini/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile,
          metrics: healthMetrics,
          allocation,
        }),
      });
      const data = await res.json();
      if (data && data.insights) {
        setGeminiInsights(data.insights);
        setGeminiStatus({
          source: data.source,
          notice: data.errorNotice || (data.isAIGenerated ? 'Live Gemini 3.8 Flash analysis' : 'Rule-based financial diagnostic engine'),
        });
      }
    } catch (err) {
      console.warn('Gemini request failed', err);
      setGeminiStatus({
        source: 'rule-based-engine',
        notice: 'API offline. Operating on deterministic mathematical engine.',
      });
    } finally {
      setIsLoadingGemini(false);
    }
  };

  const firstName = user?.name ? user.name.split(' ')[0] : 'Investor';

  // Prepare chart data for Recharts donut
  const donutData = allocation.items.map((item) => ({
    name: item.name,
    value: item.monthlyAmount > 0 ? item.monthlyAmount : item.percentage,
    percentage: item.percentage,
    color: item.color,
    monthlyAmount: item.monthlyAmount,
    purpose: item.purpose,
  }));

  // Prepare line chart data
  const growthChartData = projection.yearlyData.map((d) => ({
    yearLabel: d.year === 0 ? 'Today' : `Yr ${d.year}`,
    year: d.year,
    ProjectedValue: d.totalPortfolioValue,
    TotalInvested: d.totalInvested,
  }));

  // Scenario descriptions in plain English
  const scenarioExplanations: Record<ScenarioType, string> = {
    conservative: 'Cautious market assumption (lower equity returns, prioritizes stability).',
    moderate: 'Balanced historical baseline assumption (standard compounding over market cycles).',
    optimistic: 'Strong economic expansion assumption (higher equity and market growth).',
  };

  // Generate max 3 clean, practical next steps
  const nextSteps: { title: string; desc: string; type: 'positive' | 'warning' | 'neutral' }[] = [];

  if (healthMetrics.isDeficit) {
    nextSteps.push({
      title: 'Balance your monthly cash flow',
      desc: 'Your living expenses and loan EMIs exceed your income. Reduce discretionary spending before beginning investments.',
      type: 'warning',
    });
    nextSteps.push({
      title: 'Review existing debt obligations',
      desc: 'Focus extra cash on paying off high-interest loans to free up monthly cash flow.',
      type: 'warning',
    });
    nextSteps.push({
      title: 'Set aside a small emergency cushion',
      desc: 'Build at least one month of basic living expenses in a bank account for peace of mind.',
      type: 'neutral',
    });
  } else {
    if (healthMetrics.emergencyFundGap > 0) {
      nextSteps.push({
        title: `Build your emergency reserve (${formatINR(healthMetrics.emergencyFundGap)} remaining)`,
        desc: 'Save this buffer in a liquid savings account before putting large sums into the stock market.',
        type: 'warning',
      });
    } else {
      nextSteps.push({
        title: 'Emergency reserve is fully funded',
        desc: 'You have a healthy safety buffer of 6 months. You can invest your monthly surplus with confidence.',
        type: 'positive',
      });
    }

    if (allocation.totalMonthlyAllocated > 0) {
      nextSteps.push({
        title: `Set up an automated monthly SIP of ${formatINR(allocation.totalMonthlyAllocated)}`,
        desc: 'Automating your investments right after salary day ensures you consistently save and invest without thinking.',
        type: 'neutral',
      });
    }

    nextSteps.push({
      title: 'Review insurance coverage for your dependents',
      desc: `Ensure you have pure term life insurance (around ${formatINR(allocation.protection.termInsuranceCover, true)}) plus health cover to safeguard your family.`,
      type: 'neutral',
    });
  }

  // Limit to exactly 3 items
  const finalNextSteps = nextSteps.slice(0, 3);

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* SECTION A: WELCOME HEADER */}
      <section className="fintech-card p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold text-[#17243A] tracking-tight">
              Welcome back, {firstName}
            </h1>
            <p className="text-xs sm:text-sm text-[#667085]">
              Here is your personalized investment plan for <strong>{profile.goal}</strong> with a <strong>{profile.investmentHorizonYears}-year horizon</strong> and <strong>{profile.riskTolerance.toLowerCase()} risk profile</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={onEditProfile}
              className="flex items-center gap-1.5 rounded-lg border border-[#E3EAF3] bg-white px-3.5 py-2 text-xs font-semibold text-[#17243A] hover:bg-[#F5F8FC] transition-colors shadow-2xs"
            >
              <Sliders className="h-3.5 w-3.5 text-[#667085]" />
              <span>Edit Financial Profile</span>
            </button>

            <button
              onClick={handleRegenerate}
              disabled={isRegenerating}
              className="flex items-center gap-1.5 rounded-lg bg-[#3478F6] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#2563EB] transition-colors shadow-2xs disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
              <span>Regenerate Plan</span>
            </button>
          </div>
        </div>
      </section>

      {/* SECTION B: FOUR FINANCIAL SUMMARY CARDS */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Monthly Income */}
        <div className="fintech-card p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#667085]">Monthly Income</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#3478F6]">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-[#17243A]">
              {formatINR(profile.monthlyIncome)}
            </div>
            <p className="text-xs text-[#667085] mt-1 leading-snug">
              Your take-home in-hand earnings each month ({formatINR(profile.monthlyIncome * 12, true)} per year).
            </p>
          </div>
        </div>

        {/* Card 2: Monthly Expenses + EMI */}
        <div className="fintech-card p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#667085]">Monthly Expenses + EMI</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FFF4D6] text-[#92400E]">
              <CreditCard className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-[#17243A]">
              {formatINR(healthMetrics.essentialMonthlyExpenses)}
            </div>
            <p className="text-xs text-[#667085] mt-1 leading-snug">
              Total monthly commitments (living costs of {formatINR(profile.monthlyExpenses, true)} plus loan EMIs of {formatINR(profile.monthlyEMI, true)}).
            </p>
          </div>
        </div>

        {/* Card 3: Money Left to Invest */}
        <div className="fintech-card p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#667085]">Money Left to Invest</span>
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                healthMetrics.monthlySurplus < 0
                  ? 'bg-[#FDECEC] text-[#991B1B]'
                  : 'bg-[#E8F7EF] text-[#065F46]'
              }`}
            >
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div
              className={`text-2xl font-bold font-mono ${
                healthMetrics.monthlySurplus < 0 ? 'text-[#991B1B]' : 'text-[#065F46]'
              }`}
            >
              {formatINR(healthMetrics.monthlySurplus)}
            </div>
            <p className="text-xs text-[#667085] mt-1 leading-snug">
              {healthMetrics.monthlySurplus < 0
                ? 'Your monthly expenses exceed income. Work on reducing costs before investing.'
                : 'The amount remaining after monthly expenses and debt payments that you can invest.'}
            </p>
          </div>
        </div>

        {/* Card 4: Existing Savings */}
        <div className="fintech-card p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#667085]">Existing Savings</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#3478F6]">
              <PiggyBank className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-[#17243A]">
              {formatINR(profile.existingSavings)}
            </div>
            <p className="text-xs text-[#667085] mt-1 leading-snug">
              Your currently available savings in bank accounts and fixed deposits.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION C: RECOMMENDED INVESTMENT PLAN */}
      <section className="fintech-card p-6 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-[#17243A]">
            Recommended Investment Plan
          </h2>
          <p className="text-xs text-[#667085] mt-0.5">
            Suggested monthly allocation of {formatINR(allocation.totalMonthlyAllocated)} tailored for your <strong>{profile.riskTolerance.toLowerCase()} risk profile</strong> over <strong>{profile.investmentHorizonYears} years</strong>.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Donut Chart (5 cols) */}
          <div className="lg:col-span-5 h-64 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#FFFFFF" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any, name: any, item: any) => [
                    `${formatINR(Number(item.payload.monthlyAmount))} / mo (${item.payload.percentage}%)`,
                    name,
                  ]}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E3EAF3',
                    borderRadius: '0.5rem',
                    fontSize: '12px',
                    color: '#17243A',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-[11px] font-semibold text-[#667085]">Monthly SIP</span>
              <span className="text-lg font-bold font-mono text-[#17243A]">
                {formatINR(allocation.totalMonthlyAllocated)}
              </span>
            </div>
          </div>

          {/* Allocation Table (7 cols) */}
          <div className="lg:col-span-7 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E3EAF3] text-[#667085]">
                  <th className="pb-2.5 font-semibold">Category</th>
                  <th className="pb-2.5 font-semibold">Monthly Amount</th>
                  <th className="pb-2.5 font-semibold">Share</th>
                  <th className="pb-2.5 font-semibold">Purpose</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9EFF6]">
                {allocation.items.map((item) => (
                  <tr key={item.id} className="hover:bg-[#F8FAFD]">
                    <td className="py-2.5 font-semibold text-[#17243A] flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span>{item.name}</span>
                    </td>
                    <td className="py-2.5 font-mono font-bold text-[#17243A]">
                      {formatINR(item.monthlyAmount)}
                    </td>
                    <td className="py-2.5 text-[#17243A] font-semibold">
                      {item.percentage}%
                    </td>
                    <td className="py-2.5 text-[#667085] leading-relaxed">
                      {item.purpose}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Protection Note & Rationale */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-[#E3EAF3]">
          {/* Why this fits your profile */}
          <div className="fintech-card-subtle p-4 space-y-1.5">
            <span className="text-xs font-bold text-[#17243A] flex items-center gap-1.5">
              <Info className="h-4 w-4 text-[#3478F6]" />
              Why this allocation fits your profile
            </span>
            <p className="text-xs text-[#667085] leading-relaxed">
              With a <strong>{profile.riskTolerance.toLowerCase()} risk tolerance</strong> and a <strong>{profile.investmentHorizonYears}-year duration</strong>, this mix balances growth in equities with safety in debt and gold to protect your savings against short-term market drops.
            </p>
          </div>

          {/* Insurance Protection (Separated) */}
          <div className="fintech-card-subtle p-4 space-y-1.5">
            <span className="text-xs font-bold text-[#17243A] flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-[#3478F6]" />
              Insurance Protection (Not an investment)
            </span>
            <p className="text-xs text-[#667085] leading-relaxed">
              We recommend <strong>{formatINR(allocation.protection.termInsuranceCover, true)}</strong> in pure term life insurance plus family health cover. Insurance protects your family from unexpected crises; it is not meant to earn financial returns.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION D: FUTURE INVESTMENT GROWTH */}
      <section className="fintech-card p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E3EAF3] pb-4">
          <div>
            <h2 className="text-lg font-bold text-[#17243A]">
              Future Investment Growth
            </h2>
            <p className="text-xs text-[#667085] mt-0.5">
              Estimated growth of your monthly contributions over {profile.investmentHorizonYears} years.
            </p>
          </div>

          {/* Scenario Selector */}
          <div className="flex items-center gap-1 rounded-lg bg-[#F5F8FC] p-1 border border-[#E3EAF3]">
            {(['conservative', 'moderate', 'optimistic'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setScenario(s)}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${
                  scenario === s
                    ? 'bg-white text-[#3478F6] shadow-xs'
                    : 'text-[#667085] hover:text-[#17243A]'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Scenario Explanation in Plain English */}
        <div className="rounded-lg bg-[#EFF6FF] border border-[#DBEAFE] p-3 text-xs text-[#1E40AF]">
          <strong>{scenario.toUpperCase()} SCENARIO:</strong> {scenarioExplanations[scenario]}
        </div>

        {/* Growth Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="fintech-card-subtle p-3.5 space-y-1">
            <span className="text-[11px] font-semibold text-[#667085] block">Total Amount Invested</span>
            <span className="text-lg font-bold font-mono text-[#17243A] block">
              {formatINR(projection.totalInvested)}
            </span>
            <span className="text-[10px] text-[#667085]">Money contributed from your pocket</span>
          </div>

          <div className="fintech-card-subtle p-3.5 space-y-1">
            <span className="text-[11px] font-semibold text-[#667085] block">Estimated Growth</span>
            <span className="text-lg font-bold font-mono text-[#065F46] block">
              +{formatINR(projection.estimatedGains)}
            </span>
            <span className="text-[10px] text-[#667085]">Compound wealth generated</span>
          </div>

          <div className="fintech-card-subtle p-3.5 space-y-1">
            <span className="text-[11px] font-semibold text-[#667085] block">Projected Total Value</span>
            <span className="text-lg font-bold font-mono text-[#3478F6] block">
              {formatINR(projection.finalNominalValue)}
            </span>
            <span className="text-[10px] text-[#667085]">At end of year {profile.investmentHorizonYears}</span>
          </div>

          <div className="fintech-card-subtle p-3.5 space-y-1">
            <span className="text-[11px] font-semibold text-[#667085] block">Assumed Annual Return</span>
            <span className="text-lg font-bold font-mono text-[#17243A] block">
              {projection.assumedWeightedReturnPct}%
            </span>
            <span className="text-[10px] text-[#667085]">Blended simulated rate</span>
          </div>
        </div>

        {/* Area Line Chart */}
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={growthChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="growthColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3478F6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#3478F6" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="investedColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#94A3B8" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#94A3B8" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E9EFF6" vertical={false} />
              <XAxis dataKey="yearLabel" stroke="#94A3B8" fontSize={11} tickLine={false} />
              <YAxis
                stroke="#94A3B8"
                fontSize={11}
                tickLine={false}
                tickFormatter={(val) => formatINR(val, true)}
              />
              <Tooltip
                formatter={(val: any, name: any) => [
                  formatINR(Number(val)),
                  name === 'ProjectedValue' ? 'Projected Portfolio Value' : 'Total Money Invested',
                ]}
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E3EAF3',
                  borderRadius: '0.5rem',
                  fontSize: '12px',
                  color: '#17243A',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                }}
              />
              <Area
                type="monotone"
                dataKey="ProjectedValue"
                stroke="#3478F6"
                strokeWidth={2.5}
                fill="url(#growthColor)"
              />
              <Area
                type="monotone"
                dataKey="TotalInvested"
                stroke="#94A3B8"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                fill="url(#investedColor)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Step-up toggle & Disclaimer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-[#E3EAF3] text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setEnableStepUp(!enableStepUp)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                enableStepUp
                  ? 'bg-[#EBF2FE] border-[#3478F6] text-[#3478F6]'
                  : 'bg-white border-[#E3EAF3] text-[#667085]'
              }`}
            >
              Step-Up SIP ({profile.expectedSalaryGrowth}% annual increase): {enableStepUp ? 'Enabled' : 'Disabled'}
            </button>
            <span className="text-[11px] text-[#667085] hidden md:inline">
              Simulates increasing your investment each year as your salary grows.
            </span>
          </div>

          <p className="text-[11px] text-[#667085]">
            * Disclaimer: Projections are hypothetical simulations, not guaranteed market returns.
          </p>
        </div>
      </section>

      {/* SECTION E: FINANCIAL HEALTH */}
      <section className="fintech-card p-6 space-y-4">
        <div>
          <h2 className="text-lg font-bold text-[#17243A]">
            Financial Health
          </h2>
          <p className="text-xs text-[#667085] mt-0.5">
            Four key health checks assessing your cash flow, savings habits, and safety buffer.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Metric 1: Monthly Surplus */}
          <div className="fintech-card-subtle p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#667085]">Monthly Surplus</span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  healthMetrics.monthlySurplus > 0
                    ? 'badge-positive'
                    : 'badge-negative'
                }`}
              >
                {healthMetrics.monthlySurplus > 0 ? 'Healthy' : 'Needs Attention'}
              </span>
            </div>
            <div className="text-xl font-bold font-mono text-[#17243A]">
              {formatINR(healthMetrics.monthlySurplus)}
            </div>
            <p className="text-xs text-[#667085] leading-relaxed">
              <strong>What it means:</strong> The net cash left in your pocket after all living expenses and EMIs are paid.
            </p>
          </div>

          {/* Metric 2: Savings Rate */}
          <div className="fintech-card-subtle p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#667085]">Savings Rate</span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  (healthMetrics.savingsRate || 0) >= 20
                    ? 'badge-positive'
                    : 'badge-warning'
                }`}
              >
                {(healthMetrics.savingsRate || 0) >= 20 ? 'Healthy' : 'Needs Attention'}
              </span>
            </div>
            <div className="text-xl font-bold font-mono text-[#17243A]">
              {healthMetrics.savingsRate !== null ? `${healthMetrics.savingsRate.toFixed(1)}%` : '0%'}
            </div>
            <p className="text-xs text-[#667085] leading-relaxed">
              <strong>What it means:</strong> The percentage of your monthly income that you keep. A healthy target is 20% or more.
            </p>
          </div>

          {/* Metric 3: EMI-to-Income Ratio */}
          <div className="fintech-card-subtle p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#667085]">EMI-to-Income Ratio</span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  (healthMetrics.emiRatio || 0) <= 35
                    ? 'badge-positive'
                    : 'badge-warning'
                }`}
              >
                {(healthMetrics.emiRatio || 0) <= 35 ? 'Healthy' : 'Needs Attention'}
              </span>
            </div>
            <div className="text-xl font-bold font-mono text-[#17243A]">
              {healthMetrics.emiRatio !== null ? `${healthMetrics.emiRatio.toFixed(1)}%` : '0%'}
            </div>
            <p className="text-xs text-[#667085] leading-relaxed">
              <strong>What it means:</strong> How much of your earnings goes toward loan repayments. Safe limit is under 35%.
            </p>
          </div>

          {/* Metric 4: Emergency Fund Gap */}
          <div className="fintech-card-subtle p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#667085]">Emergency Fund Gap</span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  healthMetrics.emergencyFundGap === 0
                    ? 'badge-positive'
                    : 'badge-warning'
                }`}
              >
                {healthMetrics.emergencyFundGap === 0 ? 'Fully Funded' : 'Build Savings'}
              </span>
            </div>
            <div className="text-xl font-bold font-mono text-[#17243A]">
              {formatINR(healthMetrics.emergencyFundGap)}
            </div>
            <p className="text-xs text-[#667085] leading-relaxed">
              <strong>What it means:</strong> Additional savings needed to complete your 6-month safety net ({formatINR(healthMetrics.emergencyFundTarget6m)}).
            </p>
          </div>
        </div>
      </section>

      {/* FEATURE 1: EXPLAINABLE AI RECOMMENDATIONS ("Why This Recommendation?") */}
      <section className="fintech-card p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E3EAF3] pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#EBF2FE] text-[#3478F6]">
                <Calculator className="h-4 w-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-[#3478F6]">
                Explainable AI & Mathematical Reasoning
              </span>
            </div>
            <h2 className="text-lg font-bold text-[#17243A]">
              Why This Recommendation?
            </h2>
            <p className="text-xs text-[#667085] mt-0.5">
              Every recommendation below is derived deterministically from your validated financial metrics with full formula breakdowns, supporting data, risks, and next steps.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchGeminiInsights}
              disabled={isLoadingGemini}
              className="flex items-center gap-1.5 rounded-xl border border-[#3478F6] bg-[#EFF6FF] px-3.5 py-2 text-xs font-semibold text-[#3478F6] hover:bg-[#DBEAFE] transition-colors disabled:opacity-50"
            >
              {isLoadingGemini ? (
                <>
                  <div className="h-3.5 w-3.5 border-2 border-[#3478F6] border-t-transparent rounded-full animate-spin" />
                  <span>Analyzing Profile...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Personalize with Gemini AI</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Gemini Live Notice if retrieved */}
        {geminiStatus && (
          <div className="rounded-xl border border-[#DBEAFE] bg-[#EFF6FF] p-4 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-[#1E40AF]">
                <Sparkles className="h-4 w-4 text-[#3478F6]" />
                <span>AI Advisory Commentary ({geminiStatus.source})</span>
              </div>
              <span className="text-[10px] text-[#667085] bg-white px-2 py-0.5 rounded-full border border-[#DBEAFE]">
                {geminiStatus.notice}
              </span>
            </div>
            {geminiInsights?.executiveSummary && (
              <p className="text-[#1E3A8A] leading-relaxed">
                <strong>Executive Assessment:</strong> {geminiInsights.executiveSummary}
              </p>
            )}
            {geminiInsights?.allocationSuitability && (
              <p className="text-[#1E3A8A] leading-relaxed">
                <strong>Allocation Suitability:</strong> {geminiInsights.allocationSuitability}
              </p>
            )}
            {geminiInsights?.insuranceAdvisory && (
              <p className="text-[#1E3A8A] leading-relaxed">
                <strong>Protection Note:</strong> {geminiInsights.insuranceAdvisory}
              </p>
            )}
          </div>
        )}

        {/* Explainable Recommendation Cards with the 6 Required Components */}
        <div className="space-y-4">
          {explainableRecs.map((rec) => {
            const isExpanded = expandedRecs[rec.id] ?? true;

            return (
              <div
                key={rec.id}
                className="rounded-2xl border border-[#E3EAF3] bg-[#FFFFFF] p-5 space-y-4 shadow-2xs hover:border-[#CBD5E1] transition-all"
              >
                {/* Header & Category */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-[#F1F5FB] text-[#3478F6] border border-[#E3EAF3]">
                        {rec.category}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          rec.severity === 'positive'
                            ? 'badge-positive'
                            : rec.severity === 'warning'
                            ? 'badge-warning'
                            : 'bg-[#EFF6FF] text-[#1E40AF]'
                        }`}
                      >
                        {rec.severity === 'positive'
                          ? 'Optimized'
                          : rec.severity === 'warning'
                          ? 'Priority Focus'
                          : 'Strategy'}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-[#17243A]">
                      {rec.title}
                    </h3>
                  </div>

                  <button
                    onClick={() => toggleRec(rec.id)}
                    className="p-1.5 text-[#667085] hover:text-[#17243A] hover:bg-[#F5F8FC] rounded-lg transition-colors"
                    title={isExpanded ? 'Collapse' : 'Expand'}
                  >
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                </div>

                {/* Component 1: Recommendation */}
                <div className="rounded-xl border border-[#E3EAF3] bg-[#F8FAFD] p-3.5 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#17243A]">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#3478F6]" />
                    <span>1. Recommendation:</span>
                  </div>
                  <p className="text-xs text-[#17243A] font-medium leading-relaxed pl-5">
                    {rec.recommendation}
                  </p>
                </div>

                {isExpanded && (
                  <div className="space-y-4 pt-1 border-t border-[#F1F5FB]">
                    {/* Component 2: Reason */}
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-[#17243A] flex items-center gap-1.5">
                        <Lightbulb className="h-3.5 w-3.5 text-[#D97706]" />
                        2. Why Relevant to Your Profile:
                      </span>
                      <p className="text-xs text-[#667085] leading-relaxed pl-5">
                        {rec.reason}
                      </p>
                    </div>

                    {/* Component 3: Supporting Numbers from User Profile */}
                    <div className="space-y-1.5">
                      <span className="text-xs font-bold text-[#17243A] flex items-center gap-1.5">
                        <Wallet className="h-3.5 w-3.5 text-[#3478F6]" />
                        3. Supporting Figures from Your Financial Profile:
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pl-5">
                        {rec.supportingNumbers.map((num, nIdx) => (
                          <div
                            key={nIdx}
                            className="p-2.5 rounded-lg border border-[#E3EAF3] bg-[#F8FAFD] space-y-0.5"
                          >
                            <span className="text-[10px] font-semibold text-[#667085] block truncate">
                              {num.label}
                            </span>
                            <span className="text-xs font-bold font-mono text-[#17243A] block">
                              {num.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Component 4: Calculation Breakdown */}
                    <div className="space-y-1.5">
                      <span className="text-xs font-bold text-[#17243A] flex items-center gap-1.5">
                        <Calculator className="h-3.5 w-3.5 text-[#059669]" />
                        4. Calculation Breakdown & Mathematical Proof:
                      </span>
                      <div className="rounded-xl border border-[#E3EAF3] bg-[#F8FAFD] p-3 text-xs font-mono space-y-1 ml-5">
                        <div>
                          <span className="text-[#667085]">Formula: </span>
                          <strong className="text-[#17243A]">{rec.calculationBreakdown.formula}</strong>
                        </div>
                        <div>
                          <span className="text-[#667085]">Inputs: </span>
                          <span className="text-[#17243A]">{rec.calculationBreakdown.inputs}</span>
                        </div>
                        <div>
                          <span className="text-[#667085]">Calculated Result: </span>
                          <strong className="text-[#3478F6]">{rec.calculationBreakdown.result}</strong>
                        </div>
                        <div className="pt-1 text-[11px] font-sans text-[#667085]">
                          {rec.calculationBreakdown.explanation}
                        </div>
                      </div>
                    </div>

                    {/* Component 5: Risks and Limitations */}
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-[#17243A] flex items-center gap-1.5">
                        <AlertTriangle className="h-3.5 w-3.5 text-[#DC2626]" />
                        5. Risks, Assumptions & Limitations:
                      </span>
                      <div className="rounded-lg bg-[#FFFBF0] border border-[#FEF3C7] p-2.5 text-xs text-[#92400E] leading-relaxed ml-5">
                        {rec.risksAndLimitations}
                      </div>
                    </div>

                    {/* Component 6: Next Action */}
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-[#17243A] flex items-center gap-1.5">
                        <ArrowRight className="h-3.5 w-3.5 text-[#3478F6]" />
                        6. Practical Next Action:
                      </span>
                      <div className="flex items-center gap-2 rounded-lg bg-[#EFF6FF] border border-[#DBEAFE] p-2.5 text-xs font-medium text-[#1E40AF] ml-5">
                        <span>{rec.nextAction}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* FEATURE 2: GOAL-BASED FINANCIAL PLANNER SUMMARY CARD */}
      <section className="fintech-card p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E3EAF3] pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#EBF2FE] text-[#3478F6]">
                <Target className="h-4 w-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-[#3478F6]">
                Goal-Based Financial Planning
              </span>
            </div>
            <h2 className="text-lg font-bold text-[#17243A]">
              My Financial Goals Summary
            </h2>
            <p className="text-xs text-[#667085] mt-0.5">
              Tracking your personalized targets against your available monthly surplus to eliminate double-counting.
            </p>
          </div>

          <button
            onClick={onNavigateToGoals}
            className="flex items-center gap-1.5 rounded-xl bg-[#3478F6] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#2563EB] transition-colors self-start sm:self-auto"
          >
            <span>Open Goal Planner</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Goals Aggregate Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Card 1: Aggregate Progress */}
          <div className="fintech-card-subtle p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#667085]">Total Goals Target</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EBF2FE] text-[#3478F6]">
                {aggregateGoals.activeGoalsCount} Active
              </span>
            </div>
            <div className="text-xl font-bold font-mono text-[#17243A]">
              {formatINR(aggregateGoals.totalCurrentSaved)}
              <span className="text-xs font-normal text-[#667085]"> / {formatINR(aggregateGoals.totalTargetAmount)}</span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-[#EBF2FE] rounded-full h-2 overflow-hidden">
              <div
                className="bg-[#3478F6] h-full rounded-full transition-all duration-500"
                style={{
                  width: `${
                    aggregateGoals.totalTargetAmount > 0
                      ? Math.min(
                          100,
                          Math.round(
                            (aggregateGoals.totalCurrentSaved /
                              aggregateGoals.totalTargetAmount) *
                              100
                          )
                        )
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>

          {/* Card 2: Combined Monthly Requirement */}
          <div className="fintech-card-subtle p-4 space-y-1">
            <span className="text-xs font-semibold text-[#667085] block">Total Monthly Requirement</span>
            <div className="text-xl font-bold font-mono text-[#17243A]">
              {formatINR(aggregateGoals.totalRequiredMonthlyZeroReturn)}
              <span className="text-xs font-normal text-[#667085]"> / mo</span>
            </div>
            <span className="text-[11px] text-[#667085] block">
              Baseline (0% return) needed across all active deadlines.
            </span>
          </div>

          {/* Card 3: Surplus Feasibility Check */}
          <div className="fintech-card-subtle p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#667085]">Capacity vs Surplus</span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  aggregateGoals.isAggregateFeasible ? 'badge-positive' : 'badge-warning'
                }`}
              >
                {aggregateGoals.isAggregateFeasible ? 'Within Capacity' : 'Surplus Exceeded'}
              </span>
            </div>
            <div className="text-xl font-bold font-mono text-[#17243A]">
              {aggregateGoals.surplusDeficitOrSurplus >= 0 ? '+' : '−'}
              {formatINR(Math.abs(aggregateGoals.surplusDeficitOrSurplus))}
            </div>
            <span className="text-[11px] text-[#667085] block">
              {aggregateGoals.isAggregateFeasible
                ? 'Uncommitted investable surplus buffer'
                : 'Monthly funding shortfall across combined goals'}
            </span>
          </div>
        </div>

        {/* Top Active Goals Mini List */}
        {userGoals.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#CBD5E1] p-6 text-center space-y-2">
            <p className="text-xs text-[#667085]">
              No financial goals configured yet. Set up milestones for emergency reserves, higher education, or property.
            </p>
            <button
              onClick={onNavigateToGoals}
              className="text-xs font-semibold text-[#3478F6] hover:underline"
            >
              + Create Your First Financial Goal
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            <span className="text-xs font-bold text-[#17243A] block">
              Active Milestones:
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {userGoals.slice(0, 4).map((g) => {
                const plan = calculateGoalPlan(g, healthMetrics.monthlySurplus);

                return (
                  <div
                    key={g.id}
                    className="p-3.5 rounded-xl border border-[#E3EAF3] bg-[#F8FAFD] flex flex-col justify-between space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-xs font-bold text-[#17243A] truncate">
                          {g.name}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-white border border-[#E3EAF3] text-[#667085]">
                          {g.category}
                        </span>
                      </div>
                      <span className="text-xs font-bold font-mono text-[#3478F6] shrink-0">
                        {formatINR(plan.requiredMonthlySavingsZeroReturn)}/mo
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="w-full bg-[#EBF2FE] rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-[#3478F6] h-full rounded-full"
                          style={{ width: `${plan.progressPct}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-[#667085]">
                        <span>{formatINR(g.currentSaved)} of {formatINR(g.targetAmount)} ({plan.progressPct}%)</span>
                        <span>{plan.remainingMonths <= 0 ? 'Deadline passed' : `${plan.remainingMonths} mos left`}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* SECTION F: PERSONALIZED NEXT STEPS */}
      <section className="fintech-card p-6 space-y-4">
        <div>
          <h2 className="text-lg font-bold text-[#17243A]">
            Personalized Next Steps
          </h2>
          <p className="text-xs text-[#667085] mt-0.5">
            Three practical actions based on your current financial figures.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {finalNextSteps.map((step, idx) => (
            <div key={idx} className="fintech-card-subtle p-4 space-y-2 flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#EBF2FE] text-[#3478F6] text-xs font-bold">
                    {idx + 1}
                  </span>
                  <h3 className="text-xs font-bold text-[#17243A]">
                    {step.title}
                  </h3>
                </div>
                <p className="text-xs text-[#667085] leading-relaxed pl-7">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION G: QUICK ACTIONS & EXPANDABLE DETAILS */}
      <section className="fintech-card p-6 space-y-5">
        <h2 className="text-lg font-bold text-[#17243A]">
          Quick Actions
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={onEditProfile}
            className="flex items-center justify-between p-4 rounded-xl border border-[#E3EAF3] bg-[#F8FAFD] hover:bg-[#EFF6FF] hover:border-[#3478F6] transition-colors text-left group"
          >
            <div>
              <span className="text-xs font-bold text-[#17243A] block group-hover:text-[#3478F6]">
                Edit Financial Profile
              </span>
              <span className="text-[11px] text-[#667085]">
                Adjust income, expenses, debt, or duration
              </span>
            </div>
            <ArrowRight className="h-4 w-4 text-[#667085] group-hover:text-[#3478F6] transition-transform group-hover:translate-x-0.5 shrink-0 ml-2" />
          </button>

          <button
            onClick={onNavigateToGoals}
            className="flex items-center justify-between p-4 rounded-xl border border-[#E3EAF3] bg-[#F8FAFD] hover:bg-[#EFF6FF] hover:border-[#3478F6] transition-colors text-left group"
          >
            <div>
              <span className="text-xs font-bold text-[#17243A] block group-hover:text-[#3478F6]">
                My Financial Goals
              </span>
              <span className="text-[11px] text-[#667085]">
                Plan milestones, deadlines & savings
              </span>
            </div>
            <Target className="h-4 w-4 text-[#667085] group-hover:text-[#3478F6] transition-transform group-hover:translate-x-0.5 shrink-0 ml-2" />
          </button>

          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center justify-between p-4 rounded-xl border border-[#E3EAF3] bg-[#F8FAFD] hover:bg-[#EFF6FF] hover:border-[#3478F6] transition-colors text-left group"
          >
            <div>
              <span className="text-xs font-bold text-[#17243A] block group-hover:text-[#3478F6]">
                View Investment Plan
              </span>
              <span className="text-[11px] text-[#667085]">
                Review asset allocation and monthly SIP
              </span>
            </div>
            <ArrowRight className="h-4 w-4 text-[#667085] group-hover:text-[#3478F6] transition-transform group-hover:translate-x-0.5 shrink-0 ml-2" />
          </button>

          <button
            onClick={onNavigateToExplorer}
            className="flex items-center justify-between p-4 rounded-xl border border-[#E3EAF3] bg-[#F8FAFD] hover:bg-[#EFF6FF] hover:border-[#3478F6] transition-colors text-left group"
          >
            <div>
              <span className="text-xs font-bold text-[#17243A] block group-hover:text-[#3478F6]">
                Explore Market Funds
              </span>
              <span className="text-[11px] text-[#667085]">
                Search funds, compare returns, and charts
              </span>
            </div>
            <Compass className="h-4 w-4 text-[#667085] group-hover:text-[#3478F6] transition-transform group-hover:translate-x-0.5 shrink-0 ml-2" />
          </button>
        </div>

        {/* Small Expandable Calculation Details (Kept discreet as requested in requirement 4) */}
        <div className="pt-2">
          <button
            onClick={() => setShowFormulaDetails(!showFormulaDetails)}
            className="flex items-center gap-1.5 text-xs text-[#667085] hover:text-[#17243A] transition-colors"
          >
            {showFormulaDetails ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            <span>{showFormulaDetails ? 'Hide calculation details' : 'View calculation details & compounding formulas'}</span>
          </button>

          {showFormulaDetails && (
            <div className="mt-3 p-4 rounded-xl border border-[#E3EAF3] bg-[#F8FAFD] text-xs font-mono text-[#667085] space-y-1.5">
              <span className="font-bold text-[#17243A] block">Formulas used:</span>
              <p>• Monthly compounding rate: i = (1 + r)^(1/12) − 1</p>
              <p>• Monthly SIP maturity: FV = P × [((1 + i)^n − 1) / i]</p>
              <p>• Emergency fund target: Monthly living expenses × 6 months</p>
              <p>• Money Left to Invest: Monthly Income − Monthly Expenses − Monthly EMI</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
