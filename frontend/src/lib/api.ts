const API_BASE = '/api';

export interface SandwichAttack {
  victimTxHash: string;
  frontrunTxHash: string;
  backrunTxHash: string;
  attackerAddress: string;
  victimLossUSD: string;
  blockNumber: number;
}

export interface ScanResult {
  walletAddress: string;
  ensName?: string;
  totalTransactions: number;
  attackedTransactions: number;
  totalLossUSD: string;
  attacks: SandwichAttack[];
  aiReport?: string;
}

export interface TransactionAnalysis {
  txHash: string;
  blockNumber: number;
  isMEVAttack: boolean;
  attackType: string;
  attack?: SandwichAttack;
  aiExplanation?: string;
  recommendations?: string[];
}

export async function scanWallet(address: string, network = 'ethereum'): Promise<ScanResult> {
  const res = await fetch(`${API_BASE}/scan/${address}?network=${network}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.error);
  return json.data;
}

export async function scanENS(name: string): Promise<ScanResult> {
  const res = await fetch(`${API_BASE}/scan/ens/${name}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.error);
  return json.data;
}

export async function analyzeTransaction(hash: string, network = 'ethereum'): Promise<TransactionAnalysis> {
  const res = await fetch(`${API_BASE}/transaction/${hash}?network=${network}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.error);
  return json.data;
}
