import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  UserGoal,
  UserFinancialProfile,
  calculateFinancialHealth,
  calculateGoalPlan,
  calculateAggregateGoalsSummary,
  calculateMonthsRemaining,
  formatINR,
} from '../services/financialEngine';
import {
  Target,
  Plus,
  Pencil,
  Trash2,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  ShieldAlert,
  ArrowRight,
  Info,
  Clock,
  Sparkles,
  Sliders,
  DollarSign,
  Briefcase,
  X,
} from 'lucide-react';

interface GoalsViewProps {
  profile: UserFinancialProfile;
  onNavigateToDashboard: () => void;
  onNavigateToQuestionnaire: () => void;
}

interface GoalFormData {
  name: string;
  category: UserGoal['category'];
  targetAmount: number;
  currentSaved: number;
  targetDate: string; // YYYY-MM
  priority: 'High' | 'Medium' | 'Low';
  description: string;
  assumedReturnRate: number;
}

const PRESET_GOALS: {
  title: string;
  category: UserGoal['category'];
  defaultAmount: (p: UserFinancialProfile) => number;
  targetMonthsFromNow: number;
  priority: 'High' | 'Medium' | 'Low';
  assumedReturn: number;
  desc: string;
}[] = [
  {
    title: 'Emergency Cushion Reserve',
    category: 'Emergency Cushion',
    defaultAmount: (p) => (p.monthlyExpenses + p.monthlyEMI) * 6,
    targetMonthsFromNow: 12,
    priority: 'High',
    assumedReturn: 0,
    desc: 'Liquid safety cushion for unforeseen expenses or career transition',
  },
  {
    title: 'Professional Tech / Workstation',
    category: 'Vehicle / Tech',
    defaultAmount: () => 100000,
    targetMonthsFromNow: 9,
    priority: 'Medium',
    assumedReturn: 0,
    desc: 'Work laptop, monitors, and ergonomic setup for career productivity',
  },
  {
    title: 'Higher Education & Certifications',
    category: 'Higher Education',
    defaultAmount: () => 250000,
    targetMonthsFromNow: 18,
    priority: 'High',
    assumedReturn: 6.5,
    desc: 'Upskilling, executive courses, and specialized technical certifications',
  },
  {
    title: 'Vacation & Travel Experience',
    category: 'Travel / Vacation',
    defaultAmount: () => 80000,
    targetMonthsFromNow: 8,
    priority: 'Low',
    assumedReturn: 0,
    desc: 'Rest and relaxation trip without incurring high-interest debt',
  },
  {
    title: 'Home Down Payment Reserve',
    category: 'Home Down Payment',
    defaultAmount: () => 1500000,
    targetMonthsFromNow: 48,
    priority: 'High',
    assumedReturn: 8.0,
    desc: 'Initial down payment and registration buffer for residential home',
  },
];

export const GoalsView: React.FC<GoalsViewProps> = ({
  profile,
  onNavigateToDashboard,
  onNavigateToQuestionnaire,
}) => {
  const { user, addGoal, updateGoal, deleteGoal } = useAuth();
  const goals: UserGoal[] = user?.goals || [];

  const health = calculateFinancialHealth(
    profile.monthlyIncome,
    profile.monthlyExpenses,
    profile.monthlyEMI,
    profile.existingSavings,
    6
  );

  const aggregateSummary = calculateAggregateGoalsSummary(goals, health.monthlySurplus);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('all');

  // Form State
  const defaultDateStr = () => {
    const d = new Date();
    d.setMonth(d.getMonth() + 12);
    const yr = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, '0');
    return `${yr}-${mo}`;
  };

  const [formData, setFormData] = useState<GoalFormData>({
    name: '',
    category: 'Other',
    targetAmount: 100000,
    currentSaved: 0,
    targetDate: defaultDateStr(),
    priority: 'Medium',
    description: '',
    assumedReturnRate: 0,
  });

  const openCreateModal = () => {
    setEditingGoalId(null);
    setFormData({
      name: '',
      category: 'Other',
      targetAmount: 100000,
      currentSaved: 0,
      targetDate: defaultDateStr(),
      priority: 'Medium',
      description: '',
      assumedReturnRate: 0,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (goal: UserGoal) => {
    setEditingGoalId(goal.id);
    setFormData({
      name: goal.name,
      category: goal.category,
      targetAmount: goal.targetAmount,
      currentSaved: goal.currentSaved,
      targetDate: goal.targetDate,
      priority: goal.priority || 'Medium',
      description: goal.description || '',
      assumedReturnRate: goal.assumedReturnRate ?? 0,
    });
    setIsModalOpen(true);
  };

  const applyPreset = (preset: typeof PRESET_GOALS[0]) => {
    const d = new Date();
    d.setMonth(d.getMonth() + preset.targetMonthsFromNow);
    const yr = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, '0');

    setFormData({
      name: preset.title,
      category: preset.category,
      targetAmount: preset.defaultAmount(profile),
      currentSaved: 0,
      targetDate: `${yr}-${mo}`,
      priority: preset.priority,
      description: preset.desc,
      assumedReturnRate: preset.assumedReturn,
    });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingGoalId) {
      updateGoal(editingGoalId, {
        name: formData.name.trim(),
        category: formData.category,
        targetAmount: Number(formData.targetAmount) || 0,
        currentSaved: Number(formData.currentSaved) || 0,
        targetDate: formData.targetDate,
        priority: formData.priority,
        description: formData.description.trim(),
        assumedReturnRate: Number(formData.assumedReturnRate) || 0,
      });
    } else {
      addGoal({
        name: formData.name.trim(),
        category: formData.category,
        targetAmount: Number(formData.targetAmount) || 0,
        currentSaved: Number(formData.currentSaved) || 0,
        targetDate: formData.targetDate,
        priority: formData.priority,
        description: formData.description.trim(),
        assumedReturnRate: Number(formData.assumedReturnRate) || 0,
      });
    }

    setIsModalOpen(false);
    setEditingGoalId(null);
  };

  // Helper to format Month/Year nicely (e.g., '2027-06' -> 'Jun 2027')
  const formatMonthYear = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const [yr, mo] = dateStr.split('-');
      const d = new Date(parseInt(yr, 10), parseInt(mo, 10) - 1, 1);
      return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  // Apply quick alternative adjustments
  const applyExtendDeadline = (goal: UserGoal, newMonths: number) => {
    const d = new Date();
    d.setMonth(d.getMonth() + newMonths);
    const yr = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, '0');
    updateGoal(goal.id, {
      targetDate: `${yr}-${mo}`,
    });
  };

  const applyAdjustTarget = (goal: UserGoal, newTarget: number) => {
    updateGoal(goal.id, {
      targetAmount: newTarget,
    });
  };

  // Filtering
  const filteredGoals = goals.filter((g) => {
    if (filterPriority !== 'all' && g.priority !== filterPriority) return false;
    const isCompleted = g.targetAmount > 0 && g.currentSaved >= g.targetAmount;
    if (filterStatus === 'completed' && !isCompleted) return false;
    if (filterStatus === 'active' && isCompleted) return false;
    return true;
  });

  // Calculate live preview metrics inside modal
  const modalMonths = calculateMonthsRemaining(formData.targetDate);
  const modalRemaining = Math.max(0, formData.targetAmount - formData.currentSaved);
  const modalMonthlyZeroReturn =
    modalMonths <= 0 ? modalRemaining : Math.ceil(modalRemaining / modalMonths);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E3EAF3] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#EBF2FE] text-[#3478F6]">
              <Target className="h-4 w-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#3478F6]">
              Financial Planning Module
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#17243A]">
            Goal-Based Financial Planner
          </h1>
          <p className="text-xs text-[#667085] mt-1 max-w-2xl leading-relaxed">
            Assign target deadlines, verify monthly feasibility against your available surplus ({formatINR(health.monthlySurplus)}/month), and eliminate double-counting with aggregate capacity tracking.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 rounded-xl bg-[#3478F6] px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#2563EB] transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Financial Goal
          </button>
          <button
            onClick={onNavigateToDashboard}
            className="flex items-center gap-1.5 rounded-xl border border-[#E3EAF3] bg-white px-3.5 py-2.5 text-xs font-semibold text-[#17243A] hover:bg-[#F5F8FC] transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      {/* AGGREGATE SUMMARY METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Card 1: Total Goals & Progress */}
        <div className="fintech-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#667085]">Total Goals Tracked</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EBF2FE] text-[#3478F6]">
              {aggregateSummary.activeGoalsCount} Active
            </span>
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-[#17243A]">
              {formatINR(aggregateSummary.totalCurrentSaved)}
            </div>
            <div className="text-xs text-[#667085] mt-0.5">
              of {formatINR(aggregateSummary.totalTargetAmount)} total target
            </div>
          </div>
          {/* Progress bar */}
          <div className="space-y-1">
            <div className="w-full bg-[#EBF2FE] rounded-full h-2 overflow-hidden">
              <div
                className="bg-[#3478F6] h-full rounded-full transition-all duration-500"
                style={{
                  width: `${
                    aggregateSummary.totalTargetAmount > 0
                      ? Math.min(
                          100,
                          Math.round(
                            (aggregateSummary.totalCurrentSaved /
                              aggregateSummary.totalTargetAmount) *
                              100
                          )
                        )
                      : 0
                  }%`,
                }}
              />
            </div>
            <div className="text-[11px] text-right font-medium text-[#667085]">
              {aggregateSummary.totalTargetAmount > 0
                ? `${Math.round(
                    (aggregateSummary.totalCurrentSaved /
                      aggregateSummary.totalTargetAmount) *
                      100
                  )}% funded`
                : '0%'}
            </div>
          </div>
        </div>

        {/* Card 2: Combined Monthly Requirement */}
        <div className="fintech-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#667085]">Total Monthly Goal Savings</span>
            <span className="text-[10px] font-medium text-[#667085]">Baseline (0% return)</span>
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-[#17243A]">
              {formatINR(aggregateSummary.totalRequiredMonthlyZeroReturn)}
            </div>
            <div className="text-xs text-[#667085] mt-0.5">
              Required every month to meet all deadlines
            </div>
          </div>
          <p className="text-[11px] text-[#667085] leading-relaxed">
            With compounding return estimates: ~{formatINR(aggregateSummary.totalRequiredMonthlyWithReturn)}/mo.
          </p>
        </div>

        {/* Card 3: Monthly Investable Surplus */}
        <div className="fintech-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#667085]">Available Monthly Surplus</span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                health.monthlySurplus > 0 ? 'badge-positive' : 'badge-negative'
              }`}
            >
              {health.monthlySurplus > 0 ? 'Positive Flow' : 'Deficit'}
            </span>
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-[#17243A]">
              {formatINR(health.monthlySurplus)}
            </div>
            <div className="text-xs text-[#667085] mt-0.5">
              Income ({formatINR(profile.monthlyIncome)}) − (Expenses + EMI)
            </div>
          </div>
          <button
            onClick={onNavigateToQuestionnaire}
            className="text-[11px] font-semibold text-[#3478F6] hover:underline flex items-center gap-1"
          >
            Adjust Income & Expenses
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        {/* Card 4: Aggregate Feasibility Check */}
        <div className="fintech-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#667085]">Aggregate Capacity</span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                aggregateSummary.isAggregateFeasible ? 'badge-positive' : 'badge-warning'
              }`}
            >
              {aggregateSummary.isAggregateFeasible ? 'Within Surplus' : 'Surplus Exceeded'}
            </span>
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-[#17243A]">
              {aggregateSummary.surplusDeficitOrSurplus >= 0 ? '+' : '−'}
              {formatINR(Math.abs(aggregateSummary.surplusDeficitOrSurplus))}
            </div>
            <div className="text-xs text-[#667085] mt-0.5">
              {aggregateSummary.surplusDeficitOrSurplus >= 0
                ? 'Uncommitted surplus buffer'
                : 'Monthly funding shortfall across goals'}
            </div>
          </div>
          <p className="text-[11px] text-[#667085] leading-relaxed">
            {aggregateSummary.isAggregateFeasible
              ? 'Your combined monthly goals fit comfortably inside your cash flow.'
              : 'Active goals require more than your monthly surplus. Stagger deadlines below.'}
          </p>
        </div>
      </div>

      {/* FILTER & STATS BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-[#667085] font-medium">Filter Status:</span>
          {(['all', 'active', 'completed'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg font-medium capitalize transition-colors ${
                filterStatus === st
                  ? 'bg-[#3478F6] text-white'
                  : 'bg-white border border-[#E3EAF3] text-[#667085] hover:text-[#17243A]'
              }`}
            >
              {st}
            </button>
          ))}

          <span className="text-[#667085] font-medium ml-2">Priority:</span>
          {(['all', 'High', 'Medium', 'Low'] as const).map((pr) => (
            <button
              key={pr}
              onClick={() => setFilterPriority(pr)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                filterPriority === pr
                  ? 'bg-[#17243A] text-white'
                  : 'bg-white border border-[#E3EAF3] text-[#667085] hover:text-[#17243A]'
              }`}
            >
              {pr}
            </button>
          ))}
        </div>

        <div className="text-xs text-[#667085]">
          Showing <strong>{filteredGoals.length}</strong> of <strong>{goals.length}</strong> goals
        </div>
      </div>

      {/* GOALS LISTING / EMPTY STATE */}
      {filteredGoals.length === 0 ? (
        <div className="fintech-card p-12 text-center space-y-6">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EBF2FE] text-[#3478F6]">
            <Target className="h-7 w-7" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-base font-bold text-[#17243A]">No financial goals to display</h3>
            <p className="text-xs text-[#667085] leading-relaxed">
              Start building your goal roadmap. Choose a quick preset or create a custom goal with realistic deadlines and monthly targets.
            </p>
          </div>

          {/* Quick Preset Buttons */}
          <div className="pt-2">
            <span className="text-xs font-semibold text-[#667085] block mb-3">
              Quick 1-Click Goal Presets:
            </span>
            <div className="flex flex-wrap justify-center gap-2 max-w-2xl mx-auto">
              {PRESET_GOALS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    applyPreset(preset);
                    setIsModalOpen(true);
                  }}
                  className="flex items-center gap-2 rounded-xl border border-[#E3EAF3] bg-white px-3.5 py-2 text-xs font-medium text-[#17243A] hover:border-[#3478F6] hover:bg-[#F8FAFD] transition-colors"
                >
                  <Sparkles className="h-3.5 w-3.5 text-[#3478F6]" />
                  {preset.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredGoals.map((goal) => {
            const plan = calculateGoalPlan(goal, health.monthlySurplus);
            const isCompleted = plan.isAchieved;

            return (
              <div
                key={goal.id}
                className="fintech-card p-6 flex flex-col justify-between space-y-5 transition-all hover:border-[#CBD5E1]"
              >
                {/* Header of Goal Card */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium px-2.5 py-0.5 rounded-md bg-[#F1F5FB] text-[#3478F6] border border-[#E3EAF3]">
                          {goal.category}
                        </span>
                        {goal.priority && (
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              goal.priority === 'High'
                                ? 'bg-[#FEE2E2] text-[#B91C1C]'
                                : goal.priority === 'Medium'
                                ? 'bg-[#FEF3C7] text-[#92400E]'
                                : 'bg-[#E2E8F0] text-[#475569]'
                            }`}
                          >
                            {goal.priority} Priority
                          </span>
                        )}
                        {isCompleted && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E8F7EF] text-[#059669] flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Completed
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-[#17243A] mt-2">
                        {goal.name}
                      </h3>
                      {goal.description && (
                        <p className="text-xs text-[#667085] mt-0.5 line-clamp-2">
                          {goal.description}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(goal)}
                        className="p-1.5 text-[#667085] hover:text-[#3478F6] hover:bg-[#F5F8FC] rounded-lg transition-colors"
                        title="Edit Goal"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete "${goal.name}"?`)) {
                            deleteGoal(goal.id);
                          }
                        }}
                        className="p-1.5 text-[#667085] hover:text-[#DC2626] hover:bg-[#FEE2E2] rounded-lg transition-colors"
                        title="Delete Goal"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Progress & Target numbers */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-baseline justify-between text-xs">
                      <div>
                        <span className="font-bold font-mono text-[#17243A] text-sm">
                          {formatINR(goal.currentSaved)}
                        </span>
                        <span className="text-[#667085]"> saved</span>
                      </div>
                      <div>
                        <span className="text-[#667085]">Target: </span>
                        <span className="font-bold font-mono text-[#17243A]">
                          {formatINR(goal.targetAmount)}
                        </span>
                      </div>
                    </div>

                    <div className="w-full bg-[#EBF2FE] rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isCompleted ? 'bg-[#10B981]' : 'bg-[#3478F6]'
                        }`}
                        style={{ width: `${plan.progressPct}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-[#667085]">
                      <span>{plan.progressPct}% achieved</span>
                      <span>
                        Remaining:{' '}
                        <strong className="text-[#17243A] font-mono">
                          {formatINR(plan.remainingAmount)}
                        </strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Timeline and Monthly Contribution Details */}
                <div className="p-4 rounded-xl border border-[#E3EAF3] bg-[#F8FAFD] space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-[#667085]">
                      <Calendar className="h-3.5 w-3.5 text-[#3478F6]" />
                      <span>Target: {formatMonthYear(goal.targetDate)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[#667085]">
                      <Clock className="h-3.5 w-3.5" />
                      <span>
                        {plan.remainingMonths <= 0
                          ? 'Deadline reached'
                          : `${plan.remainingMonths} months left`}
                      </span>
                    </div>
                  </div>

                  {/* Monthly Contribution Comparison */}
                  <div className="grid grid-cols-2 gap-3 pt-1 border-t border-[#E3EAF3]">
                    {/* Baseline Zero-Return */}
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#667085] block">
                        Baseline Savings (0% Return)
                      </span>
                      <div className="text-base font-bold font-mono text-[#17243A]">
                        {isCompleted
                          ? '₹0 / mo'
                          : `${formatINR(plan.requiredMonthlySavingsZeroReturn)} / mo`}
                      </div>
                      <span className="text-[10px] text-[#667085] block">
                        Capital preservation / Bank deposit
                      </span>
                    </div>

                    {/* With Investment Return */}
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#3478F6] block">
                        With Compounding ({goal.assumedReturnRate ?? 0}% p.a.)
                      </span>
                      <div className="text-base font-bold font-mono text-[#3478F6]">
                        {isCompleted
                          ? '₹0 / mo'
                          : `${formatINR(plan.requiredMonthlySavingsWithReturn)} / mo`}
                      </div>
                      <span className="text-[10px] text-[#667085] block">
                        {goal.assumedReturnRate && goal.assumedReturnRate > 0
                          ? 'Market investments subject to risk'
                          : 'Same as cash baseline'}
                      </span>
                    </div>
                  </div>

                  {goal.assumedReturnRate && goal.assumedReturnRate > 0 && !isCompleted && (
                    <p className="text-[10px] text-[#667085] italic leading-tight">
                      * Assumes {goal.assumedReturnRate}% annual market compounding; equity and mutual fund returns are not guaranteed.
                    </p>
                  )}
                </div>

                {/* Feasibility Alert & 3 Alternatives if Infeasible */}
                {!isCompleted && !plan.isFeasibleWithSurplus && (
                  <div className="rounded-xl border border-[#FDECEC] bg-[#FFF8F8] p-4 space-y-3">
                    <div className="flex items-start gap-2.5">
                      <AlertTriangle className="h-4 w-4 text-[#DC2626] shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-[#DC2626]">
                          Exceeds Available Monthly Surplus
                        </h4>
                        <p className="text-xs text-[#667085] leading-relaxed">
                          Requires <strong>{formatINR(plan.requiredMonthlySavingsZeroReturn)}/mo</strong>, which exceeds your current investable surplus of <strong>{formatINR(health.monthlySurplus)}/mo</strong> by <strong>{formatINR(plan.shortfallPerMonth)}/mo</strong>.
                        </p>
                      </div>
                    </div>

                    {/* 3 Practical Alternatives */}
                    <div className="space-y-2 pt-1 border-t border-[#FCD5D5]">
                      <span className="text-[11px] font-bold text-[#17243A] block">
                        Recommended Plan Adjustments:
                      </span>

                      <div className="space-y-1.5 text-xs text-[#17243A]">
                        {/* Alternative A: Extend Deadline */}
                        {plan.alternativeNewDeadlineMonths > plan.remainingMonths && (
                          <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-[#E3EAF3]">
                            <div>
                              <span className="font-semibold block">1. Extend Deadline</span>
                              <span className="text-[11px] text-[#667085]">
                                Extend to {plan.alternativeNewDeadlineMonths} months to invest comfortably at {formatINR(health.monthlySurplus)}/mo
                              </span>
                            </div>
                            <button
                              onClick={() => applyExtendDeadline(goal, plan.alternativeNewDeadlineMonths)}
                              className="text-xs font-semibold text-[#3478F6] hover:underline shrink-0 ml-2"
                            >
                              Apply
                            </button>
                          </div>
                        )}

                        {/* Alternative B: Adjust Target */}
                        {plan.alternativeAdjustedTarget > 0 && plan.alternativeAdjustedTarget < goal.targetAmount && (
                          <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-[#E3EAF3]">
                            <div>
                              <span className="font-semibold block">2. Adjust Target Amount</span>
                              <span className="text-[11px] text-[#667085]">
                                Lower target to {formatINR(plan.alternativeAdjustedTarget)} to match current surplus
                              </span>
                            </div>
                            <button
                              onClick={() => applyAdjustTarget(goal, plan.alternativeAdjustedTarget)}
                              className="text-xs font-semibold text-[#3478F6] hover:underline shrink-0 ml-2"
                            >
                              Apply
                            </button>
                          </div>
                        )}

                        {/* Alternative C: Increase Monthly Savings Capacity */}
                        <div className="p-2 rounded-lg bg-white border border-[#E3EAF3]">
                          <span className="font-semibold block">3. Increase Monthly Savings Capacity</span>
                          <span className="text-[11px] text-[#667085]">
                            Reduce discretionary living expenses or increase income by at least <strong>{formatINR(plan.shortfallPerMonth)}/month</strong>.
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT GOAL MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#17243A]/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl border border-[#E3EAF3] bg-white p-6 shadow-xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-[#E3EAF3] pb-3">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-[#3478F6]" />
                <h3 className="text-base font-bold text-[#17243A]">
                  {editingGoalId ? 'Edit Financial Goal' : 'Create New Financial Goal'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-[#667085] hover:text-[#17243A] rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Quick Presets if creating */}
            {!editingGoalId && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-[#667085]">Quick Starter Presets:</span>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_GOALS.map((pr, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => applyPreset(pr)}
                      className="text-[11px] px-2.5 py-1 rounded-lg border border-[#E3EAF3] bg-[#F8FAFD] text-[#17243A] hover:bg-[#EBF2FE] hover:text-[#3478F6] transition-colors"
                    >
                      {pr.title}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Goal Title */}
              <div>
                <label className="block text-xs font-semibold text-[#17243A] mb-1">
                  Goal Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Emergency Buffer, Higher Education, Home Down Payment"
                  className="w-full rounded-xl border border-[#E3EAF3] px-3.5 py-2.5 text-xs text-[#17243A] focus:border-[#3478F6] focus:outline-hidden"
                />
              </div>

              {/* Category & Priority */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#17243A] mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full rounded-xl border border-[#E3EAF3] px-3 py-2.5 text-xs text-[#17243A] focus:border-[#3478F6] focus:outline-hidden"
                  >
                    <option value="Emergency Cushion">Emergency Cushion</option>
                    <option value="Higher Education">Higher Education</option>
                    <option value="Home Down Payment">Home Down Payment</option>
                    <option value="Vehicle / Tech">Vehicle / Tech</option>
                    <option value="Travel / Vacation">Travel / Vacation</option>
                    <option value="Long-term Wealth">Long-term Wealth</option>
                    <option value="Wedding / Family">Wedding / Family</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#17243A] mb-1">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full rounded-xl border border-[#E3EAF3] px-3 py-2.5 text-xs text-[#17243A] focus:border-[#3478F6] focus:outline-hidden"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              {/* Target Amount & Current Saved */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#17243A] mb-1">
                    Target Amount (₹) *
                  </label>
                  <input
                    type="number"
                    min="1000"
                    step="5000"
                    required
                    value={formData.targetAmount || ''}
                    onChange={(e) => setFormData({ ...formData, targetAmount: Number(e.target.value) })}
                    className="w-full rounded-xl border border-[#E3EAF3] px-3.5 py-2.5 text-xs font-mono text-[#17243A] focus:border-[#3478F6] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#17243A] mb-1">
                    Already Saved (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="5000"
                    value={formData.currentSaved || ''}
                    onChange={(e) => setFormData({ ...formData, currentSaved: Number(e.target.value) })}
                    className="w-full rounded-xl border border-[#E3EAF3] px-3.5 py-2.5 text-xs font-mono text-[#17243A] focus:border-[#3478F6] focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Target Date & Expected Return */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#17243A] mb-1">
                    Target Month & Year *
                  </label>
                  <input
                    type="month"
                    required
                    value={formData.targetDate}
                    onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                    className="w-full rounded-xl border border-[#E3EAF3] px-3 py-2 text-xs text-[#17243A] focus:border-[#3478F6] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#17243A] mb-1">
                    Expected Return (% p.a.)
                  </label>
                  <select
                    value={formData.assumedReturnRate}
                    onChange={(e) => setFormData({ ...formData, assumedReturnRate: Number(e.target.value) })}
                    className="w-full rounded-xl border border-[#E3EAF3] px-3 py-2 text-xs text-[#17243A] focus:border-[#3478F6] focus:outline-hidden"
                  >
                    <option value={0}>0% (Cash / Savings Deposit)</option>
                    <option value={6.5}>6.5% (Conservative Debt / FD)</option>
                    <option value={8.0}>8.0% (Balanced Portfolio)</option>
                    <option value={10.0}>10.0% (Equity Compounding)</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-[#17243A] mb-1">
                  Description / Purpose
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g., Buffer for tech setup, tuition fees, down payment"
                  className="w-full rounded-xl border border-[#E3EAF3] px-3.5 py-2 text-xs text-[#17243A] focus:border-[#3478F6] focus:outline-hidden"
                />
              </div>

              {/* Real-time Math Preview inside Modal */}
              <div className="rounded-xl border border-[#E3EAF3] bg-[#F8FAFD] p-3.5 space-y-1.5 text-xs">
                <span className="font-bold text-[#17243A] block">Real-Time Plan Estimation:</span>
                <div className="flex items-center justify-between text-[#667085]">
                  <span>Remaining to save:</span>
                  <span className="font-bold font-mono text-[#17243A]">{formatINR(modalRemaining)}</span>
                </div>
                <div className="flex items-center justify-between text-[#667085]">
                  <span>Timeline duration:</span>
                  <span className="font-bold text-[#17243A]">
                    {modalMonths <= 0 ? 'Less than 1 month' : `${modalMonths} months`}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[#667085]">
                  <span>Required baseline contribution:</span>
                  <span className="font-bold font-mono text-[#3478F6]">
                    {formatINR(modalMonthlyZeroReturn)} / month
                  </span>
                </div>
                <div className="flex items-center justify-between text-[#667085] pt-1 border-t border-[#E3EAF3]">
                  <span>Surplus capacity status:</span>
                  <span
                    className={`font-semibold ${
                      modalMonthlyZeroReturn <= health.monthlySurplus
                        ? 'text-[#059669]'
                        : 'text-[#DC2626]'
                    }`}
                  >
                    {modalMonthlyZeroReturn <= health.monthlySurplus
                      ? `Fits within surplus (${formatINR(health.monthlySurplus)})`
                      : `Exceeds surplus by ${formatINR(modalMonthlyZeroReturn - Math.max(0, health.monthlySurplus))}`}
                  </span>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-[#E3EAF3] bg-white px-4 py-2 text-xs font-semibold text-[#667085] hover:text-[#17243A]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#3478F6] px-5 py-2 text-xs font-semibold text-white hover:bg-[#2563EB] shadow-xs"
                >
                  {editingGoalId ? 'Save Changes' : 'Create Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
