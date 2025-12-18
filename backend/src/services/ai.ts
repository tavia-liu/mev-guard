import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface AttackContext {
  victimTxHash: string;
  blockNumber: number;
  victimAddress: string;
  frontrunHash?: string;
  backrunHash?: string;
  attackerAddress?: string;
}

export async function analyzeAttack(context: AttackContext): Promise<{
  explanation: string;
  recommendations: string[];
}> {
  const prompt = `You are an MEV (Maximal Extractable Value) expert. Analyze this potential sandwich attack and explain it simply.

Transaction Details:
- Victim Transaction: ${context.victimTxHash}
- Block Number: ${context.blockNumber}
- Victim Address: ${context.victimAddress}
${context.frontrunHash ? `- Frontrun Transaction: ${context.frontrunHash}` : ''}
${context.backrunHash ? `- Backrun Transaction: ${context.backrunHash}` : ''}
${context.attackerAddress ? `- Attacker Address: ${context.attackerAddress}` : ''}

Respond in JSON format:
{
  "explanation": "2-3 sentence explanation of what happened in plain English",
  "recommendations": ["3-4 actionable tips to avoid this in the future"]
}`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250514',
    max_tokens: 500,
    messages: [{ role: 'user', content: prompt }],
  });

  const content = response.content[0];
  if (content.type !== 'text') {
    return {
      explanation: 'Unable to analyze this transaction.',
      recommendations: ['Use MEV protection services like MEV Blocker'],
    };
  }

  try {
    const parsed = JSON.parse(content.text);
    return {
      explanation: parsed.explanation,
      recommendations: parsed.recommendations,
    };
  } catch {
    return {
      explanation: content.text,
      recommendations: ['Use MEV protection services like MEV Blocker'],
    };
  }
}

export async function generateReport(scanResult: {
  walletAddress: string;
  totalTransactions: number;
  attackedTransactions: number;
  totalLossUSD: string;
}): Promise<string> {
  const prompt = `Generate a brief MEV exposure report for this wallet:
- Address: ${scanResult.walletAddress}
- Total swap transactions: ${scanResult.totalTransactions}
- Transactions affected by MEV: ${scanResult.attackedTransactions}
- Estimated total loss: $${scanResult.totalLossUSD}

Write 2-3 sentences summarizing the findings and risk level.`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250514',
    max_tokens: 200,
    messages: [{ role: 'user', content: prompt }],
  });

  const content = response.content[0];
  return content.type === 'text' ? content.text : 'Unable to generate report.';
}
