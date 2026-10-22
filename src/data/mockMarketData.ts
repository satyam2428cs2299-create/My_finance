/**
 * Educational & Illustrative Market Data for Stock & Mutual Fund Explorer
 * Note: Clearly identified as educational simulation data with fixed timestamps.
 */

export interface MarketAsset {
  id: string;
  ticker: string;
  name: string;
  category: 'Equity MF' | 'Debt MF' | 'Hybrid MF' | 'Index Fund' | 'Stock' | 'Gold ETF';
  subCategory: string;
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Very High';
  recommendedHorizon: '1-3 Years' | '3-5 Years' | '5+ Years';
  currentPriceOrNAV: number;
  benchmark: string;
  expenseRatioOrPE: string;
  aumOrMarketCap: string;
  historicalReturns: {
    oneYear: number;
    threeYearCAGR: number;
    fiveYearCAGR: number;
  };
  chartHistory: {
    month: string;
    value: number;
  }[];
  description: string;
  diversificationRole: string;
  topHoldingsOrSectors: string[];
}

export const DEMO_DATA_TIMESTAMP = 'October 2026 (Simulated Illustrative Data)';

export const MARKET_ASSETS: MarketAsset[] = [
  {
    id: 'ppfc',
    ticker: 'PPFAS-FLEXI',
    name: 'Parag Parikh Flexi Cap Fund',
    category: 'Equity MF',
    subCategory: 'Flexi Cap Equity',
    riskLevel: 'High',
    recommendedHorizon: '5+ Years',
    currentPriceOrNAV: 78.45,
    benchmark: 'Nifty 500 TRI',
    expenseRatioOrPE: '0.68% (Expense Ratio)',
    aumOrMarketCap: '₹74,500 Cr (AUM)',
    historicalReturns: {
      oneYear: 18.2,
      threeYearCAGR: 19.8,
      fiveYearCAGR: 21.4,
    },
    chartHistory: [
      { month: '2021', value: 42.1 },
      { month: '2022', value: 49.3 },
      { month: '2023', value: 58.7 },
      { month: '2024', value: 67.2 },
      { month: '2025', value: 74.0 },
      { month: '2026', value: 78.45 },
    ],
    description: 'A value-conscious flexi-cap fund that invests across large, mid, and small Indian corporations alongside international exposure.',
    diversificationRole: 'Core long-term equity compounder providing international diversification and defensive cash holding capabilities.',
    topHoldingsOrSectors: ['HDFC Bank', 'ITC Ltd', 'Power Grid', 'Alphabet Inc', 'Coal India'],
  },
  {
    id: 'nifty-50-index',
    ticker: 'UTI-NIFTY50',
    name: 'UTI Nifty 50 Index Fund',
    category: 'Index Fund',
    subCategory: 'Large Cap Index',
    riskLevel: 'Moderate',
    recommendedHorizon: '5+ Years',
    currentPriceOrNAV: 162.3,
    benchmark: 'Nifty 50 TRI',
    expenseRatioOrPE: '0.19% (Expense Ratio)',
    aumOrMarketCap: '₹18,200 Cr (AUM)',
    historicalReturns: {
      oneYear: 14.1,
      threeYearCAGR: 15.3,
      fiveYearCAGR: 16.2,
    },
    chartHistory: [
      { month: '2021', value: 100.0 },
      { month: '2022', value: 112.5 },
      { month: '2023', value: 126.8 },
      { month: '2024', value: 144.1 },
      { month: '2025', value: 155.0 },
      { month: '2026', value: 162.3 },
    ],
    description: 'Passively replicates India’s flagship 50 largest blue-chip enterprises with minimal tracking error and rock-bottom expense ratios.',
    diversificationRole: 'Anchor index holding minimizing fund-manager risk while capturing broad Indian economic growth.',
    topHoldingsOrSectors: ['Financial Services (34%)', 'IT (14%)', 'Oil & Gas (11%)', 'Consumer (9%)'],
  },
  {
    id: 'hdfc-midcap',
    ticker: 'HDFC-MIDOPP',
    name: 'HDFC Mid-Cap Opportunities Fund',
    category: 'Equity MF',
    subCategory: 'Mid Cap Equity',
    riskLevel: 'Very High',
    recommendedHorizon: '5+ Years',
    currentPriceOrNAV: 184.2,
    benchmark: 'Nifty Midcap 150 TRI',
    expenseRatioOrPE: '0.78% (Expense Ratio)',
    aumOrMarketCap: '₹68,900 Cr (AUM)',
    historicalReturns: {
      oneYear: 24.5,
      threeYearCAGR: 26.1,
      fiveYearCAGR: 23.8,
    },
    chartHistory: [
      { month: '2021', value: 85.0 },
      { month: '2022', value: 98.4 },
      { month: '2023', value: 124.0 },
      { month: '2024', value: 158.6 },
      { month: '2025', value: 175.2 },
      { month: '2026', value: 184.2 },
    ],
    description: 'Invests predominantly in medium-sized enterprises with high compounding runway and scalable industry market share.',
    diversificationRole: 'Alpha-generating allocation suited for investors with multi-year horizons willing to endure short-term drawdowns.',
    topHoldingsOrSectors: ['Indian Hotels', 'Tata Communications', 'Bharat Electronics', 'Balkrishna Industries'],
  },
  {
    id: 'icici-baf',
    ticker: 'ICICI-BAF',
    name: 'ICICI Prudential Balanced Advantage Fund',
    category: 'Hybrid MF',
    subCategory: 'Dynamic Asset Allocation',
    riskLevel: 'Moderate',
    recommendedHorizon: '3-5 Years',
    currentPriceOrNAV: 64.12,
    benchmark: 'Nifty 50 Hybrid Composite Debt',
    expenseRatioOrPE: '0.85% (Expense Ratio)',
    aumOrMarketCap: '₹56,400 Cr (AUM)',
    historicalReturns: {
      oneYear: 12.8,
      threeYearCAGR: 13.9,
      fiveYearCAGR: 13.2,
    },
    chartHistory: [
      { month: '2021', value: 41.5 },
      { month: '2022', value: 46.2 },
      { month: '2023', value: 51.0 },
      { month: '2024', value: 57.8 },
      { month: '2025', value: 61.9 },
      { month: '2026', value: 64.12 },
    ],
    description: 'Dynamically shifts allocation between equity and fixed income using in-house P/B and market valuation metrics to dampen volatility.',
    diversificationRole: 'All-weather asset stabilizer suited for conservative to moderate investors seeking equity upside with built-in cushions.',
    topHoldingsOrSectors: ['Equities (58%)', 'Corporate Debt (28%)', 'Arbitrage & Cash (14%)'],
  },
  {
    id: 'sbi-debt',
    ticker: 'SBI-MEDDUR',
    name: 'SBI Medium Duration Debt Fund',
    category: 'Debt MF',
    subCategory: 'Medium Duration Debt',
    riskLevel: 'Low',
    recommendedHorizon: '1-3 Years',
    currentPriceOrNAV: 44.8,
    benchmark: 'Crisil Medium Duration Debt Index',
    expenseRatioOrPE: '0.52% (Expense Ratio)',
    aumOrMarketCap: '₹12,400 Cr (AUM)',
    historicalReturns: {
      oneYear: 7.2,
      threeYearCAGR: 6.9,
      fiveYearCAGR: 7.4,
    },
    chartHistory: [
      { month: '2021', value: 34.2 },
      { month: '2022', value: 36.4 },
      { month: '2023', value: 38.9 },
      { month: '2024', value: 41.5 },
      { month: '2025', value: 43.1 },
      { month: '2026', value: 44.8 },
    ],
    description: 'Maintains portfolio Macaulay duration of 3 to 4 years primarily composed of high-grade AAA corporate papers and Sovereign G-Secs.',
    diversificationRole: 'Predictable yield accrual insulating portfolio from stock market turbulence and liquidity needs.',
    topHoldingsOrSectors: ['Government of India 7.18%', 'NABARD AAA Bonds', 'HDFC Bank Tier-2', 'SIDBI Bonds'],
  },
  {
    id: 'gold-etf',
    ticker: 'NIPPON-GOLDBEES',
    name: 'Nippon India ETF Gold BeES',
    category: 'Gold ETF',
    subCategory: 'Physical Sovereign Gold Track',
    riskLevel: 'Moderate',
    recommendedHorizon: '3-5 Years',
    currentPriceOrNAV: 62.5,
    benchmark: 'Domestic Price of Gold (99.5% Purity)',
    expenseRatioOrPE: '0.79% (Expense Ratio)',
    aumOrMarketCap: '₹14,800 Cr (AUM)',
    historicalReturns: {
      oneYear: 16.5,
      threeYearCAGR: 14.8,
      fiveYearCAGR: 13.9,
    },
    chartHistory: [
      { month: '2021', value: 37.8 },
      { month: '2022', value: 42.1 },
      { month: '2023', value: 48.0 },
      { month: '2024', value: 54.3 },
      { month: '2025', value: 58.7 },
      { month: '2026', value: 62.5 },
    ],
    description: 'Direct exchange-traded fund backed by 99.5% pure physical gold held in audited institutional vaults.',
    diversificationRole: 'Geopolitical crisis hedge and negative correlation anchor against currency devaluation.',
    topHoldingsOrSectors: ['Physical Gold 99.5% Purity (98.8%)', 'Cash & Tri-Party Repo (1.2%)'],
  },
  {
    id: 'stock-tcs',
    ticker: 'TCS.NS',
    name: 'Tata Consultancy Services Ltd',
    category: 'Stock',
    subCategory: 'Large Cap IT Services',
    riskLevel: 'Moderate',
    recommendedHorizon: '5+ Years',
    currentPriceOrNAV: 4120.0,
    benchmark: 'Nifty IT Index',
    expenseRatioOrPE: '28.4 (P/E Ratio)',
    aumOrMarketCap: '₹14,90,000 Cr (Market Cap)',
    historicalReturns: {
      oneYear: 12.4,
      threeYearCAGR: 13.8,
      fiveYearCAGR: 15.6,
    },
    chartHistory: [
      { month: '2021', value: 2480 },
      { month: '2022', value: 2950 },
      { month: '2023', value: 3340 },
      { month: '2024', value: 3820 },
      { month: '2025', value: 3990 },
      { month: '2026', value: 4120 },
    ],
    description: 'Global IT exporter and technology consultant with industry-leading operating profit margins and disciplined return on capital.',
    diversificationRole: 'Quality blue-chip dividend compounder with strong foreign currency export cash flows.',
    topHoldingsOrSectors: ['Banking & Financial Services', 'Retail & CPG', 'Life Sciences & Healthcare'],
  },
  {
    id: 'stock-hdfcbank',
    ticker: 'HDFCBANK.NS',
    name: 'HDFC Bank Ltd',
    category: 'Stock',
    subCategory: 'Large Cap Private Banking',
    riskLevel: 'Moderate',
    recommendedHorizon: '5+ Years',
    currentPriceOrNAV: 1680.5,
    benchmark: 'Nifty Bank Index',
    expenseRatioOrPE: '18.9 (P/E Ratio)',
    aumOrMarketCap: '₹12,80,000 Cr (Market Cap)',
    historicalReturns: {
      oneYear: 9.8,
      threeYearCAGR: 11.2,
      fiveYearCAGR: 13.5,
    },
    chartHistory: [
      { month: '2021', value: 1150 },
      { month: '2022', value: 1320 },
      { month: '2023', value: 1480 },
      { month: '2024', value: 1560 },
      { month: '2025', value: 1610 },
      { month: '2026', value: 1680.5 },
    ],
    description: 'India’s largest private-sector banking powerhouse with unmatched retail deposit franchise and fortress balance sheet.',
    diversificationRole: 'Foundational economic credit proxy benefiting from Indian domestic retail and commercial consumption expansion.',
    topHoldingsOrSectors: ['Retail Banking', 'Wholesale Commercial Lending', 'Mortgages & Treasury'],
  },
  {
    id: 'stock-reliance',
    ticker: 'RELIANCE.NS',
    name: 'Reliance Industries Ltd',
    category: 'Stock',
    subCategory: 'Large Cap Conglomerate',
    riskLevel: 'High',
    recommendedHorizon: '5+ Years',
    currentPriceOrNAV: 2940.0,
    benchmark: 'Nifty 50 Index',
    expenseRatioOrPE: '26.8 (P/E Ratio)',
    aumOrMarketCap: '₹19,85,000 Cr (Market Cap)',
    historicalReturns: {
      oneYear: 17.5,
      threeYearCAGR: 16.2,
      fiveYearCAGR: 18.0,
    },
    chartHistory: [
      { month: '2021', value: 1680 },
      { month: '2022', value: 2100 },
      { month: '2023', value: 2420 },
      { month: '2024', value: 2750 },
      { month: '2025', value: 2880 },
      { month: '2026', value: 2940 },
    ],
    description: 'India’s largest conglomerate spanning digital connectivity (Jio), nationwide retail outlets, and green energy transition infrastructure.',
    diversificationRole: 'Mega-cap conglomerate exposure with integrated telecom, consumer retail, and energy operations.',
    topHoldingsOrSectors: ['Digital Services (Jio)', 'Retail Chain', 'Oil to Chemicals', 'New Energy Gigafactories'],
  },
];
