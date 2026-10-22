import React from 'react';
import { AlertTriangle, X, Lock } from 'lucide-react';

interface DisclaimerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DisclaimerModal: React.FC<DisclaimerModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl border border-[#E3EAF3] bg-white p-6 sm:p-8 shadow-xl space-y-6 max-h-[90vh] overflow-y-auto text-[#17243A]">
        <div className="flex items-center justify-between border-b border-[#E3EAF3] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FFF4D6] text-[#92400E]">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#17243A]">
                Statutory Notice & Privacy Governance
              </h2>
              <p className="text-xs text-[#667085]">
                Regulatory boundaries, calculation assumptions, and data privacy policies.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#667085] hover:text-[#17243A] hover:bg-[#F5F8FC]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs text-[#667085] leading-relaxed">
          <div className="rounded-xl border border-[#FDE68A] bg-[#FFF4D6] p-4 space-y-2 text-[#92400E]">
            <h3 className="font-bold text-sm">
              1. Non-Advisory & Educational Simulation Notice
            </h3>
            <p>
              AI Finance Advisor 4.0 is an educational financial technology modeling tool designed to demonstrate mathematical compounding, quantitative risk mapping, and cash-flow diagnostics. It is <strong>not</strong> registered as an Investment Advisor (RIA) or Research Analyst under the Securities and Exchange Board of India (SEBI) or any other financial regulatory authority.
            </p>
            <p>
              Nothing in this software should be construed as legal, tax, or investment advice, or as a recommendation to buy or sell securities, mutual funds, gold, or insurance policies. Investments in securities are subject to market risks, including the possible loss of principal.
            </p>
          </div>

          <div className="space-y-1.5">
            <h3 className="font-bold text-[#17243A] text-sm">
              2. Simulation Assumptions & Scenarios
            </h3>
            <p>
              All future wealth projections, charts, and compound growth figures are simulated hypothetical outcomes based on user inputs and explicitly labeled annual return assumptions:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-[#667085]">
              <li>Emergency Cash / Liquid Instruments: 3.0% per annum</li>
              <li>Fixed Deposits / Debt Funds: 4.5% to 7.5% per annum depending on scenario</li>
              <li>Diversified Equity Mutual Funds: 6.0% to 15.0% per annum depending on scenario</li>
              <li>Diversified Blue-Chip Stocks: 5.0% to 17.0% per annum depending on scenario</li>
              <li>Precious Metals (Gold): 3.0% to 10.0% per annum</li>
              <li>Estimated Annual Inflation: 5.0% per annum</li>
            </ul>
            <p>
              These rates represent simulation stress-test parameters, not guaranteed returns or verified forward forecasts.
            </p>
          </div>

          <div className="space-y-1.5">
            <h3 className="font-bold text-[#17243A] text-sm">
              3. Protection Separation Architecture
            </h3>
            <p>
              AI Finance Advisor 4.0 strictly isolates Term Life Insurance and Comprehensive Health Insurance from investment returns. Term insurance is evaluated as a pure mortality risk mitigation tool (15× annual income) with 0% investment yield.
            </p>
          </div>

          <div className="space-y-1.5">
            <h3 className="font-bold text-[#17243A] text-sm flex items-center gap-1.5">
              <Lock className="h-4 w-4 text-[#065F46]" />
              4. Client-Side Data Privacy & Security
            </h3>
            <p>
              Your financial figures (income, expenses, EMI, net worth) are stored within your browser's private local sandboxed storage. No banking credentials, PAN, or account numbers are collected.
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-[#E3EAF3]">
          <button
            onClick={onClose}
            className="rounded-lg bg-[#3478F6] px-5 py-2 text-xs font-semibold text-white hover:bg-[#2563EB] transition-colors"
          >
            I Understand & Agree
          </button>
        </div>
      </div>
    </div>
  );
};
