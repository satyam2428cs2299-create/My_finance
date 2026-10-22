import React from 'react';
import {
  ArrowRight,
  PieChart,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react';

interface WelcomeViewProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

export const WelcomeView: React.FC<WelcomeViewProps> = ({
  onGetStarted,
  onSignIn,
}) => {
  return (
    <div className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-12">
      <div className="text-center space-y-5 max-w-2xl mx-auto">
        <span className="inline-block rounded-full bg-[#EBF2FE] px-3 py-1 text-xs font-semibold text-[#3478F6]">
          AI Finance Advisor 4.0
        </span>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#17243A] leading-tight">
          Make Smarter Financial Decisions with AI
        </h1>
        <p className="text-sm sm:text-base text-[#667085] leading-relaxed font-normal">
          Personalized financial planning, transparent portfolio allocation, and compounding growth models built around your cash flow, risk profile, and life goals.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={onGetStarted}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg bg-[#3478F6] px-6 py-3 text-xs font-bold text-white hover:bg-[#2563EB] transition-colors cursor-pointer shadow-xs"
          >
            <span>Get Started Free</span>
            <ArrowRight className="h-4 w-4" />
          </button>

          <button
            onClick={onSignIn}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg border border-[#E3EAF3] bg-white px-6 py-3 text-xs font-semibold text-[#17243A] hover:bg-[#F8FAFD] transition-colors cursor-pointer shadow-2xs"
          >
            Sign In to Existing Plan
          </button>
        </div>
      </div>

      {/* 3 clean pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-6">
        <div className="fintech-card p-6 space-y-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#3478F6]">
            <PieChart className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-bold text-[#17243A]">
            Asset Allocation
          </h3>
          <p className="text-xs text-[#667085] leading-relaxed">
            Rule-based distribution across equity mutual funds, debt instruments, gold ETFs, and blue-chip stocks matched to your horizon and risk tolerance.
          </p>
        </div>

        <div className="fintech-card p-6 space-y-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#3478F6]">
            <TrendingUp className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-bold text-[#17243A]">
            Compounding Projections
          </h3>
          <p className="text-xs text-[#667085] leading-relaxed">
            Multi-year growth simulations accounting for monthly compounding, annual salary step-up increases, and purchasing power adjustments.
          </p>
        </div>

        <div className="fintech-card p-6 space-y-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#E8F7EF] text-[#065F46]">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-bold text-[#17243A]">
            Safety & Protection First
          </h3>
          <p className="text-xs text-[#667085] leading-relaxed">
            Calculates liquid emergency reserves separately from market investments. Evaluates term life and health coverage as pure risk protection.
          </p>
        </div>
      </div>
    </div>
  );
};
