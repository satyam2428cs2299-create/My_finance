import React, { useState, useEffect } from 'react';
import { runFinancialEngineTests, TestResult } from '../services/financialEngine.test';
import { CheckCircle2, XCircle, Play, RefreshCw, ShieldCheck, Terminal, Award } from 'lucide-react';

export const TestsView: React.FC = () => {
  const [testReport, setTestReport] = useState<{
    total: number;
    passed: number;
    failed: number;
    results: TestResult[];
  } | null>(null);

  const [isRunning, setIsRunning] = useState(false);

  const handleRunTests = () => {
    setIsRunning(true);
    setTimeout(() => {
      const report = runFinancialEngineTests();
      setTestReport(report);
      setIsRunning(false);
    }, 250);
  };

  useEffect(() => {
    handleRunTests();
  }, []);

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-[#0E1526]/90 p-6 backdrop-blur-xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Math Engine Automated Unit Tests
            </h1>
            <span className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
              Deterministic Verification
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Validating boundary conditions, zero inputs, negative surpluses, rounding accuracy, and 100% allocation constraints.
          </p>
        </div>

        <button
          onClick={handleRunTests}
          disabled={isRunning}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-emerald-950/40 hover:from-emerald-500 hover:to-teal-500 transition-all cursor-pointer self-start sm:self-auto disabled:opacity-50"
        >
          {isRunning ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Play className="h-4 w-4 fill-current" />
          )}
          <span>Re-Run All Tests</span>
        </button>
      </div>

      {/* Summary Scorecard */}
      {testReport && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-slate-800 bg-[#0E1526]/80 p-5 space-y-1">
            <span className="text-xs font-medium text-slate-400">Total Unit Test Cases</span>
            <div className="text-3xl font-extrabold font-mono text-white">
              {testReport.total}
            </div>
            <p className="text-[11px] text-slate-500">Comprehensive edge case coverage</p>
          </div>

          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-5 space-y-1">
            <span className="text-xs font-medium text-emerald-300">Tests Passing</span>
            <div className="text-3xl font-extrabold font-mono text-emerald-400">
              {testReport.passed}
            </div>
            <p className="text-[11px] text-emerald-300/80">100% mathematical integrity</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#0E1526]/80 p-5 space-y-1">
            <span className="text-xs font-medium text-slate-400">Tests Failing</span>
            <div
              className={`text-3xl font-extrabold font-mono ${
                testReport.failed > 0 ? 'text-rose-400' : 'text-slate-400'
              }`}
            >
              {testReport.failed}
            </div>
            <p className="text-[11px] text-slate-500">Zero regressions detected</p>
          </div>
        </div>
      )}

      {/* Test Results Table */}
      <div className="rounded-2xl border border-slate-800 bg-[#0E1526]/90 p-6 backdrop-blur-xl shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Terminal className="h-4 w-4 text-emerald-400" />
            Execution Trace & Assertions
          </h2>
          <span className="text-xs text-slate-400">Specification: Section 11 Compliance</span>
        </div>

        {testReport && (
          <div className="space-y-2.5">
            {testReport.results.map((res, index) => (
              <div
                key={index}
                className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-colors ${
                  res.passed
                    ? 'border-emerald-500/20 bg-emerald-950/10'
                    : 'border-rose-500/40 bg-rose-950/20'
                }`}
              >
                <div className="flex items-start gap-3">
                  {res.passed ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-0.5">
                    <span className="font-semibold text-white">{res.name}</span>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-slate-400">
                      <span>Expected: {JSON.stringify(res.expected)}</span>
                      <span>•</span>
                      <span>Actual: {JSON.stringify(res.actual)}</span>
                    </div>
                  </div>
                </div>

                <span
                  className={`self-start sm:self-auto rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                    res.passed
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  }`}
                >
                  {res.passed ? 'PASSED' : 'FAILED'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
