import express from 'express';
import type { Request, Response } from 'express';
import http from 'http';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize Google GenAI if API key is present
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

if (apiKey && apiKey !== 'MY_GEMINI_API_KEY' && apiKey.trim() !== '') {
  try {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
  }
}

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    appName: 'AI Finance Advisor 4.0',
    hasGeminiKey: !!aiClient,
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

// Server-side Gemini API route for personalized financial insights
app.post('/api/gemini/insights', async (req: Request, res: Response) => {
  try {
    const { profile, metrics, allocation } = req.body;

    if (!profile || !metrics) {
      return res.status(400).json({
        error: 'Missing required financial profile or metrics in request body.',
      });
    }

    // If Gemini client is not configured or lacks a valid key, return clearly labeled demo/rule-based response
    if (!aiClient) {
      return res.json({
        success: true,
        source: 'rule-based-engine',
        isAIGenerated: false,
        message: 'No GEMINI_API_KEY configured. Running on transparent rule-based deterministic engine.',
        insights: generateRuleBasedInsights(profile, metrics, allocation),
      });
    }

    const prompt = `You are the lead AI financial analytics engine for "AI Finance Advisor 4.0".
Analyze the following validated user financial profile and calculated mathematical metrics.

CRITICAL INSTRUCTIONS:
- You must strictly base all recommendations on the provided numbers.
- DO NOT invent, hallucinate, or alter any numbers, income, savings, or return rates.
- DO NOT promise guaranteed returns or predict market timing.
- State that these are educational simulations and estimates.
- If cash flow is negative or tight, prioritize cash-flow preservation and debt reduction.
- Explicitly emphasize that insurance is protection, not an investment.

USER DATA:
- Age: ${profile.age}
- Occupation: ${profile.occupation}
- Financial Knowledge: ${profile.knowledgeLevel}
- Dependents: ${profile.dependents}
- Main Financial Goal: ${profile.goal}
- Monthly Income: ₹${profile.monthlyIncome?.toLocaleString('en-IN')}
- Monthly Expenses: ₹${profile.monthlyExpenses?.toLocaleString('en-IN')}
- Monthly EMI: ₹${profile.monthlyEMI?.toLocaleString('en-IN')}
- Monthly Investable Surplus: ₹${metrics.monthlySurplus?.toLocaleString('en-IN')}
- Existing Savings: ₹${profile.existingSavings?.toLocaleString('en-IN')}
- Savings Rate: ${metrics.savingsRate ? metrics.savingsRate.toFixed(1) + '%' : 'N/A'}
- Expense Ratio: ${metrics.expenseRatio ? metrics.expenseRatio.toFixed(1) + '%' : 'N/A'}
- EMI Burden Ratio: ${metrics.emiRatio ? metrics.emiRatio.toFixed(1) + '%' : 'N/A'}
- Emergency Fund 6-month Target: ₹${metrics.emergencyFundTarget6m?.toLocaleString('en-IN')}
- Emergency Fund Gap: ₹${metrics.emergencyFundGap?.toLocaleString('en-IN')}
- Risk Tolerance: ${profile.riskTolerance}
- Expected Salary Growth: ${profile.expectedSalaryGrowth}%
- Investment Horizon: ${profile.investmentHorizonYears} years

Provide your response in JSON format matching this schema:
{
  "executiveSummary": "2-3 concise sentences summarizing their current financial posture and highest priority.",
  "emergencyFundAnalysis": "Assessment of their emergency reserve vs 6-month recommended buffer (₹${metrics.emergencyFundTarget6m?.toLocaleString('en-IN')}).",
  "cashFlowAndDebtAssessment": "Analysis of savings rate (${metrics.savingsRate ? metrics.savingsRate.toFixed(1) + '%' : 'N/A'}) and debt burden (${metrics.emiRatio ? metrics.emiRatio.toFixed(1) + '%' : 'N/A'}).",
  "allocationSuitability": "Evaluation of their risk tolerance (${profile.riskTolerance}) against their ${profile.investmentHorizonYears}-year horizon and main goal (${profile.goal}).",
  "insuranceAdvisory": "Explanation of protection needs (term life & health) separate from investments.",
  "actionSteps": [
    "Step 1: Immediate action",
    "Step 2: Near-term step",
    "Step 3: Long-term optimization",
    "Step 4: Monitoring recommendation"
  ]
}`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text || '';
    let parsedInsights;

    try {
      parsedInsights = JSON.parse(responseText);
    } catch {
      // Fallback if parsing failed
      parsedInsights = generateRuleBasedInsights(profile, metrics, allocation);
    }

    return res.json({
      success: true,
      source: 'gemini-3.8-flash',
      isAIGenerated: true,
      insights: parsedInsights,
    });
  } catch (error: any) {
    console.error('Gemini API Error details:', error?.status, error?.message, error);
    // Graceful fallback to transparent rule-based engine
    const fallback = generateRuleBasedInsights(
      req.body?.profile || {},
      req.body?.metrics || {},
      req.body?.allocation
    );
    return res.json({
      success: true,
      source: 'rule-based-engine',
      isAIGenerated: false,
      errorNotice: 'Gemini API unavailable or project key restricted. Operating on transparent rule-based diagnostic engine.',
      insights: fallback,
    });
  }
});

// Deterministic rule-based insights generator for offline / no-key mode
function generateRuleBasedInsights(profile: any, metrics: any, _allocation: any) {
  const surplus = metrics?.monthlySurplus ?? 0;
  const savingsRate = metrics?.savingsRate ?? 0;
  const emiRatio = metrics?.emiRatio ?? 0;
  const emergencyGap = metrics?.emergencyFundGap ?? 0;
  const horizon = profile?.investmentHorizonYears ?? 5;
  const risk = profile?.riskTolerance ?? 'Moderate';
  const goal = profile?.goal ?? 'Wealth Growth';

  let executiveSummary = '';
  if (surplus < 0) {
    executiveSummary = `Your monthly outflows exceed your incoming cash by ₹${Math.abs(surplus).toLocaleString('en-IN')}. Immediate expense reduction and debt restructuring are critical before initiating new investments.`;
  } else if (emergencyGap > 0) {
    executiveSummary = `You have a healthy monthly surplus of ₹${surplus.toLocaleString('en-IN')}, but your liquid emergency fund is short by ₹${emergencyGap.toLocaleString('en-IN')}. Prioritize completing your safety buffer first.`;
  } else {
    executiveSummary = `Strong financial profile with a positive savings rate of ${savingsRate.toFixed(1)}% and an adequately funded emergency reserve. You are well positioned to pursue long-term compounding toward ${goal}.`;
  }

  const emergencyFundAnalysis = emergencyGap > 0
    ? `Your current liquid savings are below the recommended 6-month buffer of ₹${(metrics?.emergencyFundTarget6m || 0).toLocaleString('en-IN')}. We advise channeling the first ₹${emergencyGap.toLocaleString('en-IN')} of investable capital into high-liquidity instruments like savings accounts or liquid mutual funds.`
    : `Your emergency reserve meets or exceeds the recommended 6-month essential living buffer (₹${(metrics?.emergencyFundTarget6m || 0).toLocaleString('en-IN')}). This allows you to invest surplus capital with confidence without needing to liquidate long-term equity during market dips.`;

  const cashFlowAndDebtAssessment = emiRatio > 40
    ? `Your EMI-to-income ratio is ${emiRatio.toFixed(1)}%, which is high. A debt burden exceeding 40% limits financial flexibility. Consider prepaying high-interest loans before aggressively scaling equity investments.`
    : `Your EMI-to-income ratio is ${emiRatio.toFixed(1)}%, comfortably within the safe benchmark of under 35%. Your monthly savings rate of ${savingsRate.toFixed(1)}% provides a sturdy foundation for consistent monthly SIP allocations.`;

  const allocationSuitability = `Given your ${risk.toLowerCase()} risk tolerance and ${horizon}-year investment horizon, the proposed asset allocation balances wealth accumulation with downside protection. Over ${horizon} years, equity compounding is supported by fixed income and gold buffers.`;

  const insuranceAdvisory = `Insurance is a risk mitigation tool, not an investment product. Based on your income and dependents, maintain a pure term life cover of at least 10–15× annual income (₹${((profile?.monthlyIncome || 0) * 12 * 10).toLocaleString('en-IN')}) plus comprehensive family health cover.`;

  const actionSteps = [];
  if (surplus < 0) {
    actionSteps.push('Conduct an immediate line-item review of discretionary monthly expenses to turn cash flow positive.');
    actionSteps.push('Review existing debt obligations and prioritize refinancing or paying off high-interest loans.');
    actionSteps.push('Postpone long-term equity or mutual fund commitments until recurring cash flow is stabilized.');
    actionSteps.push('Build a mini emergency cushion of 1 month of essential expenses.');
  } else if (emergencyGap > 0) {
    actionSteps.push(`Allocate monthly savings to close the ₹${emergencyGap.toLocaleString('en-IN')} emergency fund gap in liquid funds.`);
    actionSteps.push('Verify that term life and health insurance policies are active to protect dependents.');
    actionSteps.push('Begin a modest recurring SIP in diversified index or flexi-cap mutual funds once 3 months of buffer are saved.');
    actionSteps.push('Review portfolio allocation and rebalance every 12 months.');
  } else {
    actionSteps.push('Set up automated monthly SIP debits for the start of every month following payday.');
    actionSteps.push(`Leverage your expected ${profile?.expectedSalaryGrowth || 5}% salary growth to enable annual step-up SIP increases.`);
    actionSteps.push('Maintain separate earmarked accounts for short-term goals versus long-term retirement wealth.');
    actionSteps.push('Schedule an annual review to rebalance portfolio weights if market appreciation shifts your target asset mix.');
  }

  return {
    executiveSummary,
    emergencyFundAnalysis,
    cashFlowAndDebtAssessment,
    allocationSuitability,
    insuranceAdvisory,
    actionSteps,
  };
}

// Development mode with Vite middleware
async function setupVite() {
  const httpServer = http.createServer(app);

  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
    console.log(`Gemini API Key configured: ${!!aiClient}`);
  });
}

setupVite().catch((err) => {
  console.error('Error starting server:', err);
  process.exit(1);
});
