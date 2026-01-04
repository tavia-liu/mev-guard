import Anthropic from '@anthropic-ai/sdk';

let client: Anthropic | null = null;

function getClient(): Anthropic | null {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

export async function generateReport(data: {
  totalTransactions: number;
  attackedTransactions: number;
  totalLossUSD: string;
}): Promise<string> {
  const attackRate = data.totalTransactions > 0 
    ? ((data.attackedTransactions / data.totalTransactions) * 100).toFixed(1)
    : '0';

  const defaultReport = `This wallet has ${data.attackedTransactions} detected MEV attacks across ${data.totalTransactions} DEX swap transactions (${attackRate}% attack rate). Estimated loss: $${data.totalLossUSD}. Consider using MEV protection services like MEV Blocker or Flashbots Protect.`;

  const anthropic = getClient();
  if (!anthropic) return defaultReport;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250514',
      max_tokens: 200,
      messages: [{
        role: 'user',
        content: `Write a 2-sentence MEV exposure summary for a wallet with ${data.totalTransactions} swap transactions, ${data.attackedTransactions} MEV attacks (${attackRate}% rate), and $${data.totalLossUSD} estimated loss. Be specific and actionable.`
      }],
    });

    const content = response.content[0];
    return content.type === 'text' ? content.text : defaultReport;
  } catch {
    return defaultReport;
  }
}
