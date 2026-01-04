export interface SandwichAttack {
  victimTxHash: string;
  frontrunTxHash: string;
  backrunTxHash: string;
  attackerAddress: string;
  victimLossUSD: string;
  blockNumber: number;
  timestamp: number;
  tokenPair: string;
}

export interface ScanResult {
  walletAddress: string;
  ensName?: string;
  totalTransactions: number;
  attackedTransactions: number;
  totalLossUSD: string;
  attacks: SandwichAttack[];
  aiReport?: string;
  riskLevel: 'low' | 'medium' | 'high';
}

export async function scanWallet(addressOrENS: string): Promise<ScanResult> {
  const url = `/api/scan/${encodeURIComponent(addressOrENS)}?limit=30`;
  const res = await fetch(url);
  const json = await res.json();
  
  if (!json.success) {
    throw new Error(json.error || 'Scan failed');
  }
  
  return json.data;
}
