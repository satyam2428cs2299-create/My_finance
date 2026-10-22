import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface FooterProps {
  onOpenDisclaimer?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenDisclaimer }) => {
  return (
    <footer className="w-full border-t border-[#E3EAF3] bg-white text-[#667085] py-8 px-4 sm:px-6 lg:px-8 mt-auto text-xs">
      <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-[#EBF2FE] text-[#3478F6] font-bold text-xs">
            FA
          </div>
          <p className="text-[#667085] text-xs">
            © {new Date().getFullYear()} AI Finance Advisor 4.0. Quantitative personal financial planning.
          </p>
        </div>

        <div className="flex items-center gap-6 text-xs text-[#667085]">
          <button
            onClick={onOpenDisclaimer}
            className="hover:text-[#17243A] transition-colors"
          >
            Disclaimer & Disclosures
          </button>
          <span>Currency: INR (₹)</span>
          <span className="flex items-center gap-1 text-[#065F46]">
            <ShieldCheck className="h-3.5 w-3.5" /> Client Data Protected
          </span>
        </div>
      </div>
    </footer>
  );
};
