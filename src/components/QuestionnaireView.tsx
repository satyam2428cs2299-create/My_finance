import React, { useState } from 'react';
import {
  UserFinancialProfile,
  formatINR,
  RiskTolerance,
} from '../services/financialEngine';
import {
  User,
  IndianRupee,
  Sliders,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  Info,
} from 'lucide-react';

interface QuestionnaireViewProps {
  initialProfile?: UserFinancialProfile;
  onComplete: (profile: UserFinancialProfile) => void;
}

export const QuestionnaireView: React.FC<QuestionnaireViewProps> = ({
  initialProfile,
  onComplete,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form fields
  const [age, setAge] = useState<number>(initialProfile?.age || 26);
  const [occupation, setOccupation] = useState<string>(initialProfile?.occupation || 'Salaried Employee');
  const [knowledgeLevel, setKnowledgeLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>(
    initialProfile?.knowledgeLevel || 'Beginner'
  );
  const [dependents, setDependents] = useState<number>(initialProfile?.dependents ?? 0);
  const [goal, setGoal] = useState<string>(initialProfile?.goal || 'Wealth Growth');

  // Step 2: Financials in INR
  const [monthlyIncome, setMonthlyIncome] = useState<number>(initialProfile?.monthlyIncome || 60000);
  const [monthlyExpenses, setMonthlyExpenses] = useState<number>(initialProfile?.monthlyExpenses || 25000);
  const [monthlyEMI, setMonthlyEMI] = useState<number>(initialProfile?.monthlyEMI || 5000);
  const [existingSavings, setExistingSavings] = useState<number>(initialProfile?.existingSavings || 150000);

  // Step 3: Preferences
  const [riskTolerance, setRiskTolerance] = useState<RiskTolerance>(initialProfile?.riskTolerance || 'Moderate');
  const [expectedSalaryGrowth, setExpectedSalaryGrowth] = useState<number>(
    initialProfile?.expectedSalaryGrowth ?? 8
  );
  const [investmentHorizonYears, setInvestmentHorizonYears] = useState<number>(
    initialProfile?.investmentHorizonYears || 10
  );

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculated investable surplus
  const calculatedSurplus = monthlyIncome - monthlyExpenses - monthlyEMI;

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!age || age < 18 || age > 100) {
        newErrors.age = 'Please enter an age between 18 and 100.';
      }
      if (dependents < 0 || dependents > 20) {
        newErrors.dependents = 'Dependents must be a non-negative number.';
      }
    } else if (currentStep === 2) {
      if (monthlyIncome < 0) {
        newErrors.monthlyIncome = 'Monthly income cannot be negative.';
      }
      if (monthlyExpenses < 0) {
        newErrors.monthlyExpenses = 'Monthly expenses cannot be negative.';
      }
      if (monthlyEMI < 0) {
        newErrors.monthlyEMI = 'Monthly EMI cannot be negative.';
      }
      if (existingSavings < 0) {
        newErrors.existingSavings = 'Existing savings cannot be negative.';
      }
    } else if (currentStep === 3) {
      if (expectedSalaryGrowth < 0 || expectedSalaryGrowth > 50) {
        newErrors.expectedSalaryGrowth = 'Salary growth must be between 0% and 50%.';
      }
      if (investmentHorizonYears < 1 || investmentHorizonYears > 40) {
        newErrors.investmentHorizonYears = 'Horizon must be between 1 and 40 years.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => (Math.min(4, prev + 1) as 1 | 2 | 3 | 4));
    }
  };

  const handleBack = () => {
    setStep((prev) => (Math.max(1, prev - 1) as 1 | 2 | 3 | 4));
  };

  const handleSubmit = () => {
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      return;
    }

    setIsSubmitting(true);
    const profile: UserFinancialProfile = {
      age,
      occupation,
      knowledgeLevel,
      dependents,
      goal,
      monthlyIncome,
      monthlyExpenses,
      monthlyEMI,
      existingSavings,
      riskTolerance,
      expectedSalaryGrowth,
      investmentHorizonYears,
    };

    setTimeout(() => {
      onComplete(profile);
      setIsSubmitting(false);
    }, 250);
  };

  const occupations = [
    'Salaried Employee',
    'Self-Employed',
    'Business Owner',
    'Student',
    'Professional / Consultant',
    'Retired',
    'Other',
  ];

  const goals = [
    'Wealth Growth',
    'Retirement',
    'Education',
    'Buying a House',
    'Emergency Fund',
    'Financial Independence (FIRE)',
    'Other',
  ];

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto space-y-6">
      {/* Title */}
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-bold text-[#17243A] tracking-tight">
          Financial Profile Questionnaire
        </h1>
        <p className="text-xs text-[#667085]">
          Fill in your details below so our engine can generate your personalized investment plan.
        </p>
      </div>

      {/* Step Indicator */}
      <div className="grid grid-cols-4 gap-2 text-xs">
        {[
          { num: 1, title: 'Personal Profile' },
          { num: 2, title: 'Financial Situation' },
          { num: 3, title: 'Preferences' },
          { num: 4, title: 'Review & Plan' },
        ].map((s) => (
          <div
            key={s.num}
            onClick={() => s.num < step && setStep(s.num as any)}
            className={`rounded-lg p-2.5 border transition-all text-center ${
              step === s.num
                ? 'bg-[#EBF2FE] border-[#3478F6] text-[#3478F6] font-semibold shadow-2xs'
                : step > s.num
                ? 'bg-white border-[#E3EAF3] text-[#17243A] cursor-pointer'
                : 'bg-[#F8FAFD] border-[#E3EAF3] text-[#94A3B8] cursor-not-allowed'
            }`}
          >
            <span className="block text-[10px] text-[#667085]">Step {s.num}</span>
            <span className="truncate block font-medium">{s.title}</span>
          </div>
        ))}
      </div>

      {/* Form Container */}
      <div className="fintech-card p-6 sm:p-7 space-y-6">
        {/* STEP 1: PERSONAL PROFILE */}
        {step === 1 && (
          <div className="space-y-5">
            <div className="border-b border-[#E3EAF3] pb-3">
              <h2 className="text-sm font-bold text-[#17243A] flex items-center gap-2">
                <User className="h-4 w-4 text-[#3478F6]" />
                Step 1: Personal Profile
              </h2>
              <p className="text-xs text-[#667085] mt-0.5">
                Basic background to help customize your investment horizon.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#17243A] mb-1.5">
                  Age (Years)
                </label>
                <input
                  type="number"
                  min="18"
                  max="100"
                  value={age}
                  onChange={(e) => setAge(parseInt(e.target.value) || 0)}
                  className="w-full rounded-lg border border-[#E3EAF3] bg-white px-3 py-2.5 text-xs text-[#17243A] focus:border-[#3478F6] focus:outline-none focus:ring-1 focus:ring-[#3478F6]"
                />
                {errors.age && <p className="text-[11px] text-[#B91C1C] mt-1">{errors.age}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17243A] mb-1.5">
                  Number of Dependents
                </label>
                <input
                  type="number"
                  min="0"
                  max="15"
                  value={dependents}
                  onChange={(e) => setDependents(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full rounded-lg border border-[#E3EAF3] bg-white px-3 py-2.5 text-xs text-[#17243A] focus:border-[#3478F6] focus:outline-none focus:ring-1 focus:ring-[#3478F6]"
                />
                {errors.dependents && <p className="text-[11px] text-[#B91C1C] mt-1">{errors.dependents}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17243A] mb-1.5">
                  Occupation
                </label>
                <select
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  className="w-full rounded-lg border border-[#E3EAF3] bg-white px-3 py-2.5 text-xs text-[#17243A] focus:border-[#3478F6] focus:outline-none focus:ring-1 focus:ring-[#3478F6]"
                >
                  {occupations.map((occ) => (
                    <option key={occ} value={occ}>
                      {occ}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17243A] mb-1.5">
                  Financial Knowledge
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Beginner', 'Intermediate', 'Advanced'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setKnowledgeLevel(lvl)}
                      className={`rounded-lg py-2 text-xs font-semibold border transition-colors ${
                        knowledgeLevel === lvl
                          ? 'bg-[#EBF2FE] border-[#3478F6] text-[#3478F6]'
                          : 'border-[#E3EAF3] bg-white text-[#667085] hover:text-[#17243A] hover:bg-[#F8FAFD]'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#17243A] mb-1.5">
                  Main Financial Goal
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {goals.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGoal(g)}
                      className={`rounded-lg py-2 px-3 text-xs text-left border transition-colors ${
                        goal === g
                          ? 'bg-[#EBF2FE] border-[#3478F6] text-[#3478F6] font-semibold'
                          : 'border-[#E3EAF3] bg-white text-[#667085] hover:text-[#17243A] hover:bg-[#F8FAFD]'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: FINANCIAL SITUATION */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="border-b border-[#E3EAF3] pb-3">
              <h2 className="text-sm font-bold text-[#17243A] flex items-center gap-2">
                <IndianRupee className="h-4 w-4 text-[#3478F6]" />
                Step 2: Financial Situation (in INR)
              </h2>
              <p className="text-xs text-[#667085] mt-0.5">
                Enter your monthly cash flow figures in Indian Rupees (₹).
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#17243A] mb-1.5">
                  Monthly Income (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full rounded-lg border border-[#E3EAF3] bg-white px-3 py-2.5 text-xs text-[#17243A] focus:border-[#3478F6] focus:outline-none focus:ring-1 focus:ring-[#3478F6]"
                />
                <p className="text-[11px] text-[#667085] mt-1">{formatINR(monthlyIncome)} / month</p>
                {errors.monthlyIncome && <p className="text-[11px] text-[#B91C1C] mt-1">{errors.monthlyIncome}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17243A] mb-1.5">
                  Monthly Expenses (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={monthlyExpenses}
                  onChange={(e) => setMonthlyExpenses(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full rounded-lg border border-[#E3EAF3] bg-white px-3 py-2.5 text-xs text-[#17243A] focus:border-[#3478F6] focus:outline-none focus:ring-1 focus:ring-[#3478F6]"
                />
                <p className="text-[11px] text-[#667085] mt-1">Living costs: {formatINR(monthlyExpenses)} / month</p>
                {errors.monthlyExpenses && <p className="text-[11px] text-[#B91C1C] mt-1">{errors.monthlyExpenses}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17243A] mb-1.5">
                  Monthly EMI / Debt Payments (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={monthlyEMI}
                  onChange={(e) => setMonthlyEMI(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full rounded-lg border border-[#E3EAF3] bg-white px-3 py-2.5 text-xs text-[#17243A] focus:border-[#3478F6] focus:outline-none focus:ring-1 focus:ring-[#3478F6]"
                />
                <p className="text-[11px] text-[#667085] mt-1">Loan repayments: {formatINR(monthlyEMI)} / month</p>
                {errors.monthlyEMI && <p className="text-[11px] text-[#B91C1C] mt-1">{errors.monthlyEMI}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17243A] mb-1.5">
                  Existing Savings (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="10000"
                  value={existingSavings}
                  onChange={(e) => setExistingSavings(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full rounded-lg border border-[#E3EAF3] bg-white px-3 py-2.5 text-xs text-[#17243A] focus:border-[#3478F6] focus:outline-none focus:ring-1 focus:ring-[#3478F6]"
                />
                <p className="text-[11px] text-[#667085] mt-1">Bank & FD balance: {formatINR(existingSavings)}</p>
                {errors.existingSavings && <p className="text-[11px] text-[#B91C1C] mt-1">{errors.existingSavings}</p>}
              </div>
            </div>

            {/* Live Investable Savings Diagnostic Card */}
            <div
              className={`rounded-lg p-4 border text-xs ${
                calculatedSurplus < 0
                  ? 'badge-negative'
                  : 'badge-positive'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold block text-sm">Monthly Investable Savings</span>
                  <span className="text-xs opacity-90">
                    Income ({formatINR(monthlyIncome)}) − Expenses ({formatINR(monthlyExpenses)}) − EMI ({formatINR(monthlyEMI)})
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold font-mono block">
                    {formatINR(calculatedSurplus)}
                  </span>
                </div>
              </div>

              {calculatedSurplus < 0 && (
                <div className="mt-2.5 flex items-center gap-1.5 text-xs border-t border-red-300 pt-2 font-medium">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>Your monthly spending exceeds earnings. We advise reducing expenses before putting money into investments.</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 3: INVESTMENT PREFERENCES */}
        {step === 3 && (
          <div className="space-y-5">
            <div className="border-b border-[#E3EAF3] pb-3">
              <h2 className="text-sm font-bold text-[#17243A] flex items-center gap-2">
                <Sliders className="h-4 w-4 text-[#3478F6]" />
                Step 3: Investment Preferences
              </h2>
              <p className="text-xs text-[#667085] mt-0.5">
                Set your comfort with risk and intended investment timeline.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17243A] mb-2">
                Risk Tolerance
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(['Low', 'Moderate', 'High'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRiskTolerance(r)}
                    className={`rounded-xl p-3.5 text-left border transition-colors ${
                      riskTolerance === r
                        ? 'border-[#3478F6] bg-[#EBF2FE]'
                        : 'border-[#E3EAF3] bg-white hover:bg-[#F8FAFD]'
                    }`}
                  >
                    <span className="block text-xs font-bold text-[#17243A]">{r} Risk</span>
                    <span className="block text-xs text-[#667085] mt-1">
                      {r === 'Low'
                        ? 'Preserves capital with safe fixed income and debt.'
                        : r === 'Moderate'
                        ? 'Balanced growth with mutual funds and gold.'
                        : 'Aims for high returns through equity and stocks.'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="fintech-card-subtle p-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#17243A]">Expected Annual Salary Growth</span>
                <span className="font-mono font-bold text-[#3478F6]">{expectedSalaryGrowth}% / year</span>
              </div>
              <input
                type="range"
                min="0"
                max="25"
                step="1"
                value={expectedSalaryGrowth}
                onChange={(e) => setExpectedSalaryGrowth(parseInt(e.target.value) || 0)}
                className="w-full accent-[#3478F6] cursor-pointer"
              />
              <span className="block text-[11px] text-[#667085]">Models increasing your monthly investment over time as you earn more.</span>
            </div>

            <div className="fintech-card-subtle p-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#17243A]">Investment Duration</span>
                <span className="font-mono font-bold text-[#3478F6]">{investmentHorizonYears} Years</span>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                step="1"
                value={investmentHorizonYears}
                onChange={(e) => setInvestmentHorizonYears(parseInt(e.target.value) || 1)}
                className="w-full accent-[#3478F6] cursor-pointer"
              />
              <span className="block text-[11px] text-[#667085]">How long you plan to keep your money invested before withdrawing.</span>
            </div>
          </div>
        )}

        {/* STEP 4: REVIEW AND GENERATE */}
        {step === 4 && (
          <div className="space-y-5">
            <div className="border-b border-[#E3EAF3] pb-3">
              <h2 className="text-sm font-bold text-[#17243A] flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#065F46]" />
                Step 4: Review and Generate
              </h2>
              <p className="text-xs text-[#667085] mt-0.5">
                Check that your answers are accurate before generating your plan.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="fintech-card-subtle p-3.5 space-y-1.5">
                <div className="flex items-center justify-between border-b border-[#E3EAF3] pb-1.5">
                  <span className="font-bold text-[#17243A]">Personal</span>
                  <button onClick={() => setStep(1)} className="text-[11px] text-[#3478F6] font-semibold hover:underline">
                    Edit
                  </button>
                </div>
                <p className="text-[#667085]">Age: <span className="text-[#17243A] font-medium">{age}</span></p>
                <p className="text-[#667085]">Occupation: <span className="text-[#17243A] font-medium">{occupation}</span></p>
                <p className="text-[#667085]">Goal: <span className="text-[#17243A] font-medium">{goal}</span></p>
              </div>

              <div className="fintech-card-subtle p-3.5 space-y-1.5">
                <div className="flex items-center justify-between border-b border-[#E3EAF3] pb-1.5">
                  <span className="font-bold text-[#17243A]">Financials</span>
                  <button onClick={() => setStep(2)} className="text-[11px] text-[#3478F6] font-semibold hover:underline">
                    Edit
                  </button>
                </div>
                <p className="text-[#667085]">Income: <span className="text-[#17243A] font-medium">{formatINR(monthlyIncome)}</span></p>
                <p className="text-[#667085]">Expenses: <span className="text-[#17243A] font-medium">{formatINR(monthlyExpenses)}</span></p>
                <p className="text-[#667085]">Investable: <span className="text-[#065F46] font-bold">{formatINR(calculatedSurplus)}</span></p>
              </div>

              <div className="fintech-card-subtle p-3.5 space-y-1.5">
                <div className="flex items-center justify-between border-b border-[#E3EAF3] pb-1.5">
                  <span className="font-bold text-[#17243A]">Preferences</span>
                  <button onClick={() => setStep(3)} className="text-[11px] text-[#3478F6] font-semibold hover:underline">
                    Edit
                  </button>
                </div>
                <p className="text-[#667085]">Risk: <span className="text-[#17243A] font-medium">{riskTolerance}</span></p>
                <p className="text-[#667085]">Growth: <span className="text-[#17243A] font-medium">{expectedSalaryGrowth}%</span></p>
                <p className="text-[#667085]">Duration: <span className="text-[#17243A] font-medium">{investmentHorizonYears} Years</span></p>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full rounded-lg bg-[#3478F6] py-3 text-xs font-bold text-white hover:bg-[#2563EB] transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs"
              >
                {isSubmitting ? 'Calculating...' : 'Generate My Investment Plan'}
              </button>
            </div>
          </div>
        )}

        {/* Navigation footer */}
        <div className="flex items-center justify-between pt-4 border-t border-[#E3EAF3]">
          <button
            type="button"
            onClick={handleBack}
            disabled={step === 1}
            className={`flex items-center gap-1.5 rounded-lg border border-[#E3EAF3] bg-white px-3.5 py-2 text-xs font-semibold text-[#17243A] transition-colors ${
              step === 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-[#F8FAFD]'
            }`}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back</span>
          </button>

          {step < 4 && (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-1.5 rounded-lg bg-[#3478F6] px-4 py-2 text-xs font-semibold text-white hover:bg-[#2563EB] transition-colors"
            >
              <span>Continue</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
