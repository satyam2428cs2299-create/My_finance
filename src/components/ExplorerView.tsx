import React, { useState } from 'react';
import { MARKET_ASSETS, MarketAsset } from '../data/mockMarketData';
import { formatINR } from '../services/financialEngine';
import {
  Search,
  Scale,
  X,
  Compass,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

export const ExplorerView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedRisk, setSelectedRisk] = useState<string>('All');

  // Currently inspected asset for detailed chart
  const [inspectedAsset, setInspectedAsset] = useState<MarketAsset>(MARKET_ASSETS[0]);

  // Asset comparison basket (up to 3)
  const [comparisonBasket, setComparisonBasket] = useState<MarketAsset[]>([
    MARKET_ASSETS[0],
    MARKET_ASSETS[1],
  ]);

  // Filter assets
  const filteredAssets = MARKET_ASSETS.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.ticker.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.subCategory.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === 'All' || item.category === selectedCategory;

    const matchesRisk =
      selectedRisk === 'All' || item.riskLevel === selectedRisk;

    return matchesSearch && matchesCategory && matchesRisk;
  });

  const toggleComparison = (asset: MarketAsset) => {
    if (comparisonBasket.some((a) => a.id === asset.id)) {
      setComparisonBasket(comparisonBasket.filter((a) => a.id !== asset.id));
    } else {
      if (comparisonBasket.length >= 3) {
        setComparisonBasket([...comparisonBasket.slice(1), asset]);
      } else {
        setComparisonBasket([...comparisonBasket, asset]);
      }
    }
  };

  const categories = ['All', 'Equity MF', 'Debt MF', 'Hybrid MF', 'Index Fund', 'Stock', 'Gold ETF'];
  const riskLevels = ['All', 'Low', 'Moderate', 'High', 'Very High'];

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* Title */}
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-bold text-[#17243A] tracking-tight">
          Stock & Mutual Fund Explorer
        </h1>
        <p className="text-xs text-[#667085]">
          Browse popular mutual funds, index funds, gold ETFs, and stocks to understand where your money can be invested.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="fintech-card p-4 sm:p-5 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Search by fund, stock name, or ticker..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-[#E3EAF3] bg-white py-2 pl-9 pr-3 text-xs text-[#17243A] placeholder-[#94A3B8] focus:border-[#3478F6] focus:outline-none"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2.5 text-[#94A3B8] hover:text-[#17243A]"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div>
            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
              className="w-full rounded-lg border border-[#E3EAF3] bg-white py-2 px-3 text-xs text-[#17243A] focus:border-[#3478F6] focus:outline-none"
            >
              <option disabled>Filter by Risk</option>
              {riskLevels.map((r) => (
                <option key={r} value={r}>
                  Risk: {r}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                selectedCategory === cat
                  ? 'bg-[#3478F6] text-white shadow-2xs'
                  : 'bg-white text-[#667085] border border-[#E3EAF3] hover:text-[#17243A] hover:bg-[#F8FAFD]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid: Left List + Right Detail Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left List (7 cols) */}
        <div className="lg:col-span-7 space-y-2.5">
          {filteredAssets.map((asset) => {
            const isSelected = inspectedAsset.id === asset.id;
            const isInCompare = comparisonBasket.some((a) => a.id === asset.id);

            return (
              <div
                key={asset.id}
                onClick={() => setInspectedAsset(asset)}
                className={`fintech-card p-4 cursor-pointer transition-all ${
                  isSelected ? 'border-[#3478F6] ring-1 ring-[#3478F6] bg-[#F8FAFD]' : 'hover:border-[#CBD5E1]'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-[#17243A]">{asset.name}</span>
                      <span className="text-[10px] text-[#667085] font-mono">({asset.ticker})</span>
                    </div>
                    <p className="text-[11px] text-[#667085] mt-0.5">
                      {asset.subCategory} • Benchmark: {asset.benchmark}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold font-mono text-[#17243A] block">
                      ₹{asset.currentPriceOrNAV.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-[#065F46] font-semibold">
                      3Y CAGR: {asset.historicalReturns.threeYearCAGR}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-[#E3EAF3] text-[11px]">
                  <span className="text-[#667085]">{asset.expenseRatioOrPE}</span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        asset.riskLevel === 'Very High' || asset.riskLevel === 'High'
                          ? 'badge-negative'
                          : asset.riskLevel === 'Moderate'
                          ? 'badge-warning'
                          : 'badge-positive'
                      }`}
                    >
                      {asset.riskLevel} Risk
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleComparison(asset);
                      }}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-semibold border transition-colors ${
                        isInCompare
                          ? 'bg-[#3478F6] text-white border-[#3478F6]'
                          : 'border-[#E3EAF3] bg-white text-[#17243A] hover:bg-[#F8FAFD]'
                      }`}
                    >
                      {isInCompare ? 'In Compare' : '+ Compare'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Detail Chart (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="fintech-card p-5 space-y-3">
            <div className="border-b border-[#E3EAF3] pb-3">
              <span className="text-xs font-mono text-[#3478F6] font-semibold">{inspectedAsset.ticker}</span>
              <h2 className="text-sm font-bold text-[#17243A] mt-0.5">{inspectedAsset.name}</h2>
              <p className="text-[11px] text-[#667085] mt-1">{inspectedAsset.description}</p>
            </div>

            <div>
              <span className="text-xs font-semibold text-[#17243A] block mb-2">
                Simulated Historical Valuation Trend (NAV / Price)
              </span>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={inspectedAsset.chartHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E9EFF6" vertical={false} />
                    <XAxis dataKey="month" stroke="#94A3B8" fontSize={9} tickLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={9} tickLine={false} domain={['auto', 'auto']} />
                    <Tooltip
                      formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Value']}
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderColor: '#E3EAF3',
                        borderRadius: '0.5rem',
                        fontSize: '11px',
                        color: '#17243A',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#3478F6"
                      strokeWidth={2}
                      dot={{ r: 2.5, fill: '#3478F6' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="fintech-card-subtle p-3 space-y-1 text-xs">
              <span className="font-semibold text-[#17243A] block">Role in Portfolio:</span>
              <p className="text-[#667085] text-[11px] leading-relaxed">
                {inspectedAsset.diversificationRole}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Side-by-Side Comparison Table */}
      {comparisonBasket.length > 0 && (
        <div className="fintech-card p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-[#E3EAF3] pb-2.5">
            <span className="text-xs font-bold text-[#17243A] flex items-center gap-1.5">
              <Scale className="h-4 w-4 text-[#3478F6]" />
              Side-by-Side Comparison ({comparisonBasket.length} Assets)
            </span>
            <button
              onClick={() => setComparisonBasket([])}
              className="text-[11px] text-[#667085] hover:text-[#17243A]"
            >
              Clear
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E3EAF3] text-[#667085]">
                  <th className="pb-2 font-semibold">Metric</th>
                  {comparisonBasket.map((a) => (
                    <th key={a.id} className="pb-2 font-bold text-[#17243A]">
                      {a.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9EFF6] text-[11px]">
                <tr>
                  <td className="py-2.5 text-[#667085]">Category</td>
                  {comparisonBasket.map((a) => (
                    <td key={a.id} className="py-2.5 text-[#17243A]">
                      {a.category}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2.5 text-[#667085]">NAV / Price</td>
                  {comparisonBasket.map((a) => (
                    <td key={a.id} className="py-2.5 font-mono font-bold text-[#17243A]">
                      ₹{a.currentPriceOrNAV.toLocaleString('en-IN')}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2.5 text-[#667085]">Expense Ratio / P/E</td>
                  {comparisonBasket.map((a) => (
                    <td key={a.id} className="py-2.5 text-[#17243A]">
                      {a.expenseRatioOrPE}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2.5 text-[#667085]">3Y CAGR</td>
                  {comparisonBasket.map((a) => (
                    <td key={a.id} className="py-2.5 font-mono font-bold text-[#065F46]">
                      {a.historicalReturns.threeYearCAGR}%
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2.5 text-[#667085]">Recommended Horizon</td>
                  {comparisonBasket.map((a) => (
                    <td key={a.id} className="py-2.5 text-[#17243A]">
                      {a.recommendedHorizon}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
