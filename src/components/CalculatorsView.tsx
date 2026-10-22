import React, { useState } from 'react';
import {
  calculateCAGR,
  calculateCompoundInterest,
  calculateSIP,
  calculateStepUpSIP,
  calculateInflationAdjustedValue,
  calculateGoalSIP,
  formatINR,
} from '../services/financialEngine';
import {
  Calculator,
  TrendingUp,
  Percent,
  Clock,
  Target,
  Shield,
  Layers,
  ArrowRight,
  Info,
  DollarSign,
  PieChart,
} from 'lucide-react';

export const CalculatorsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'sip' | 'stepup' | 'cagr' | 'compound' | 'inflation' | 'goal'
  >('sip');

  // SIP State
  const [sipMonthly, setSipMonthly] = useState<number>(10000);
  const [sipRate, setSipRate] = useState<number>(12);
  const [sipYears, setSipYears] = useState<number>(10);
  const sipResult = calculateSIP(sipMonthly, sipRate, sipYears);

  // Step-Up SIP State
  const [stepUpMonthly, setStepUpMonthly] = useState<number>(10000);
  const [stepUpRate, setStepUpRate] = useState<number>(12);
  const [stepUpYears, setStepUpYears] = useState<number>(10);
  const [stepUpGrowth, setStepUpGrowth] = useState<number>(10);
  const stepUpResult = calculateStepUpSIP(
    stepUpMonthly,
    stepUpRate,
    stepUpYears,
    stepUpGrowth
  );

  // CAGR State
  const [cagrInitial, setCagrInitial] = useState<number>(100000);
  const [cagrFinal, setCagrFinal] = useState<number>(250000);
  const [cagrDuration, setCagrDuration] = useState<number>(5);
  const cagrResult = calculateCAGR(cagrInitial, cagrFinal, cagrDuration);

  // Lump Sum Compound Interest State
  const [ciPrincipal, setCiPrincipal] = useState<number>(200000);
  const [ciRate, setCiRate] = useState<number>(10);
  const [ciYears, setCiYears] = useState<number>(8);
  const ciResult = calculateCompoundInterest(ciPrincipal, ciRate, ciYears);

  // Inflation State
  const [infNominal, setInfNominal] = useState<number>(5000000);
  const [infRate, setInfRate] = useState<number>(5);
  const [infYears, setInfYears] = useState<number>(15);
  const infRealValue = calculateInflationAdjustedValue(infNominal, infRate, infYears);

  // Goal Planner State
  const [goalTarget, setGoalTarget] = useState<number>(5000000);
  const [goalYears, setGoalYears] = useState<number>(10);
  const [goalRate, setGoalRate] = useState<number>(12);
  const goalResult = calculateGoalSIP(goalTarget, goalYears, goalRate);

  const tabs = [
    { id: 'sip', name: 'Monthly SIP', icon: TrendingUp },
    { id: 'stepup', name: 'Step-Up SIP', icon: Layers },
    { id: 'cagr', name: 'CAGR Calculator', icon: Percent },
    { id: 'compound', name: 'Compound Interest', icon: Calculator },
    { id: 'inflation', name: 'Inflation & Purchasing Power', icon: Shield },
    { id: 'goal', name: 'Target Goal Planner', icon: Target },
  ];

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-300">
          <Calculator className="h-3.5 w-3.5 text-rose-400" />
          <span>Standalone Quantitative Toolset</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          Precision Financial Calculators
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">
          Verify compounding scenarios, evaluate real vs nominal purchasing power, and determine exact monthly capital required to achieve financial freedom.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold border transition-all ${
                isActive
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 shadow-md ring-1 ring-rose-500/30'
                  : 'border-slate-800 bg-[#0E1526]/80 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* Calculator Body */}
      <div className="rounded-2xl border border-slate-800 bg-[#0E1526]/90 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        {/* 1. MONTHLY SIP CALCULATOR */}
        {activeTab === 'sip' && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-rose-400" />
                Monthly SIP Calculator (End-of-Month Compounding)
              </h2>
              <p className="text-xs text-slate-400">
                Formula: FV = P × [((1 + i)^n − 1) / i] where i = (1 + r)^(1/12) − 1, n = 12 × years.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              {/* Sliders & Inputs */}
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-300">Monthly Contribution (P)</span>
                    <span className="font-mono font-bold text-white">{formatINR(sipMonthly)}</span>
                  </div>
                  <input
                    type="range"
                    min="500"
                    max="200000"
                    step="500"
                    value={sipMonthly}
                    onChange={(e) => setSipMonthly(parseInt(e.target.value) || 0)}
                    className="w-full accent-rose-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-300">Expected Annual Return (r)</span>
                    <span className="font-mono font-bold text-sky-400">{sipRate}%</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="30"
                    step="0.5"
                    value={sipRate}
                    onChange={(e) => setSipRate(parseFloat(e.target.value) || 0)}
                    className="w-full accent-sky-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-300">Investment Duration</span>
                    <span className="font-mono font-bold text-teal-400">{sipYears} Years</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="40"
                    step="1"
                    value={sipYears}
                    onChange={(e) => setSipYears(parseInt(e.target.value) || 1)}
                    className="w-full accent-teal-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Output Summary Card */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Simulation Outcome
                </span>
                <div className="space-y-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Total Invested Amount:</span>
                    <span className="font-bold font-mono text-white">
                      {formatINR(sipResult.investedAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Estimated Capital Growth:</span>
                    <span className="font-bold font-mono text-emerald-400">
                      +{formatINR(sipResult.estimatedGains)}
                    </span>
                  </div>
                  <div className="pt-3 border-t border-slate-800 flex justify-between items-baseline">
                    <span className="text-xs font-semibold text-slate-300">Projected Maturity Value:</span>
                    <span className="text-2xl font-extrabold font-mono text-rose-400">
                      {formatINR(sipResult.futureValue)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. STEP-UP SIP CALCULATOR */}
        {activeTab === 'stepup' && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Layers className="h-5 w-5 text-sky-400" />
                Step-Up SIP Calculator (Annual Contribution Increase)
              </h2>
              <p className="text-xs text-slate-400">
                Models salary growth increments. Your monthly contribution scales annually by your chosen percentage.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-300">Initial Monthly SIP</span>
                    <span className="font-mono font-bold text-white">{formatINR(stepUpMonthly)}</span>
                  </div>
                  <input
                    type="range"
                    min="1000"
                    max="150000"
                    step="1000"
                    value={stepUpMonthly}
                    onChange={(e) => setStepUpMonthly(parseInt(e.target.value) || 0)}
                    className="w-full accent-sky-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-300">Annual Salary / Step-Up Growth</span>
                    <span className="font-mono font-bold text-emerald-400">{stepUpGrowth}% / year</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="25"
                    step="1"
                    value={stepUpGrowth}
                    onChange={(e) => setStepUpGrowth(parseInt(e.target.value) || 0)}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-300">Annual Return Assumption</span>
                    <span className="font-mono font-bold text-sky-400">{stepUpRate}%</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="25"
                    step="0.5"
                    value={stepUpRate}
                    onChange={(e) => setStepUpRate(parseFloat(e.target.value) || 0)}
                    className="w-full accent-sky-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-300">Duration</span>
                    <span className="font-mono font-bold text-rose-400">{stepUpYears} Years</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="35"
                    step="1"
                    value={stepUpYears}
                    onChange={(e) => setStepUpYears(parseInt(e.target.value) || 1)}
                    className="w-full accent-rose-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Comparison Box */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Step-Up vs Constant SIP
                </span>
                <div className="space-y-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Total Invested with Step-Up:</span>
                    <span className="font-bold font-mono text-white">
                      {formatINR(stepUpResult.totalInvested)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Final Step-Up Future Value:</span>
                    <span className="text-xl font-bold font-mono text-sky-400">
                      {formatINR(stepUpResult.futureValue)}
                    </span>
                  </div>
                  <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 leading-relaxed">
                    By escalating your SIP by {stepUpGrowth}% each year in tandem with salary progression, your corpus generates substantially greater wealth than a static monthly investment.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. CAGR CALCULATOR */}
        {activeTab === 'cagr' && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Percent className="h-5 w-5 text-rose-400" />
                Compound Annual Growth Rate (CAGR) Calculator
              </h2>
              <p className="text-xs text-slate-400">
                Formula: CAGR = ((Final Value / Initial Value) ^ (1 / Years) − 1) × 100
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Initial Investment Value (₹)
                </label>
                <input
                  type="number"
                  min="1"
                  value={cagrInitial}
                  onChange={(e) => setCagrInitial(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 py-2.5 px-3 text-sm text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Final Portfolio Value (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={cagrFinal}
                  onChange={(e) => setCagrFinal(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 py-2.5 px-3 text-sm text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Duration (Years)
                </label>
                <input
                  type="number"
                  min="0.1"
                  step="0.5"
                  value={cagrDuration}
                  onChange={(e) => setCagrDuration(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 py-2.5 px-3 text-sm text-white font-mono"
                />
              </div>
            </div>

            {cagrResult.isValid ? (
              <div className="rounded-2xl border border-rose-500/30 bg-rose-950/20 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-300">
                    Calculated Annual Compound Rate
                  </span>
                  <div className="text-3xl font-extrabold font-mono text-rose-400 mt-1">
                    {cagrResult.cagrPct}% CAGR
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    Total Absolute Return: {cagrResult.totalGainPct}% (+{formatINR(cagrResult.absoluteGain)})
                  </p>
                </div>
                <div className="text-xs text-slate-400 max-w-sm text-left sm:text-right">
                  CAGR dampens the effect of volatility by showing what your investment would have returned compounded annually over {cagrDuration} years.
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-rose-500/40 bg-rose-950/20 p-4 text-xs text-rose-400">
                {cagrResult.errorMessage}
              </div>
            )}
          </div>
        )}

        {/* 4. COMPOUND INTEREST / LUMP SUM */}
        {activeTab === 'compound' && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Calculator className="h-5 w-5 text-teal-400" />
                Lump Sum Compound Interest Calculator
              </h2>
              <p className="text-xs text-slate-400">
                Formula: FV = Principal × (1 + r)^years
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-300">Lump Sum Principal</span>
                    <span className="font-mono font-bold text-white">{formatINR(ciPrincipal)}</span>
                  </div>
                  <input
                    type="range"
                    min="10000"
                    max="5000000"
                    step="10000"
                    value={ciPrincipal}
                    onChange={(e) => setCiPrincipal(parseInt(e.target.value) || 0)}
                    className="w-full accent-teal-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-300">Annual Return Rate</span>
                    <span className="font-mono font-bold text-teal-400">{ciRate}%</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="25"
                    step="0.5"
                    value={ciRate}
                    onChange={(e) => setCiRate(parseFloat(e.target.value) || 0)}
                    className="w-full accent-teal-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-300">Investment Period</span>
                    <span className="font-mono font-bold text-rose-400">{ciYears} Years</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="35"
                    step="1"
                    value={ciYears}
                    onChange={(e) => setCiYears(parseInt(e.target.value) || 1)}
                    className="w-full accent-rose-500 cursor-pointer"
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Lump Sum Growth
                </span>
                <div className="space-y-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Initial Principal:</span>
                    <span className="font-bold font-mono text-white">{formatINR(ciPrincipal)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Net Estimated Interest/Growth:</span>
                    <span className="font-bold font-mono text-emerald-400">
                      +{formatINR(ciResult.estimatedGrowth)}
                    </span>
                  </div>
                  <div className="pt-3 border-t border-slate-800 flex justify-between items-baseline">
                    <span className="text-xs font-semibold text-slate-300">Maturity Corpus:</span>
                    <span className="text-2xl font-extrabold font-mono text-teal-400">
                      {formatINR(ciResult.futureValue)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5. INFLATION & PURCHASING POWER */}
        {activeTab === 'inflation' && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Shield className="h-5 w-5 text-amber-400" />
                Inflation & Purchasing Power Deflator
              </h2>
              <p className="text-xs text-slate-400">
                Formula: Real Value = Nominal Value / (1 + inflationRate)^years
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-300">Nominal Future Target (₹)</span>
                    <span className="font-mono font-bold text-white">{formatINR(infNominal)}</span>
                  </div>
                  <input
                    type="range"
                    min="500000"
                    max="50000000"
                    step="500000"
                    value={infNominal}
                    onChange={(e) => setInfNominal(parseInt(e.target.value) || 0)}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-300">Assumed Annual Inflation</span>
                    <span className="font-mono font-bold text-amber-400">{infRate}%</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="12"
                    step="0.5"
                    value={infRate}
                    onChange={(e) => setInfRate(parseFloat(e.target.value) || 0)}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-300">Years into the Future</span>
                    <span className="font-mono font-bold text-sky-400">{infYears} Years</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="40"
                    step="1"
                    value={infYears}
                    onChange={(e) => setInfYears(parseInt(e.target.value) || 1)}
                    className="w-full accent-sky-500 cursor-pointer"
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-6 space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                  Real Purchasing Power in Today's Rupees
                </span>
                <div>
                  <span className="text-3xl font-extrabold font-mono text-amber-400">
                    {formatINR(infRealValue)}
                  </span>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    Due to compounding inflation at {infRate}%, {formatINR(infNominal)} in {infYears} years will purchase what <strong>{formatINR(infRealValue)}</strong> buys today. Ensure your investment returns outpace inflation!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 6. GOAL-BASED TARGET PLANNER */}
        {activeTab === 'goal' && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Target className="h-5 w-5 text-rose-400" />
                Target Goal SIP Planner
              </h2>
              <p className="text-xs text-slate-400">
                Solves required monthly contribution: P = Target × i / ((1 + i)^n − 1)
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-300">Target Corpus Needed</span>
                    <span className="font-mono font-bold text-white">{formatINR(goalTarget)}</span>
                  </div>
                  <input
                    type="range"
                    min="500000"
                    max="50000000"
                    step="500000"
                    value={goalTarget}
                    onChange={(e) => setGoalTarget(parseInt(e.target.value) || 0)}
                    className="w-full accent-rose-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-300">Time Horizon</span>
                    <span className="font-mono font-bold text-sky-400">{goalYears} Years</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="30"
                    step="1"
                    value={goalYears}
                    onChange={(e) => setGoalYears(parseInt(e.target.value) || 1)}
                    className="w-full accent-sky-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-300">Assumed Annual Growth</span>
                    <span className="font-mono font-bold text-teal-400">{goalRate}%</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="20"
                    step="0.5"
                    value={goalRate}
                    onChange={(e) => setGoalRate(parseFloat(e.target.value) || 0)}
                    className="w-full accent-teal-500 cursor-pointer"
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Required Monthly Capital
                </span>
                <div className="space-y-3">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-slate-400">Required Monthly SIP:</span>
                    <span className="text-2xl font-extrabold font-mono text-rose-400">
                      {formatINR(goalResult.requiredMonthlySIP)} / mo
                    </span>
                  </div>
                  <div className="flex justify-between text-xs pt-2 border-t border-slate-800">
                    <span className="text-slate-400">Total Direct Investment:</span>
                    <span className="font-mono font-semibold text-white">
                      {formatINR(goalResult.totalInvestment)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Compounded Growth Gain:</span>
                    <span className="font-mono font-semibold text-emerald-400">
                      +{formatINR(goalResult.projectedGains)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
