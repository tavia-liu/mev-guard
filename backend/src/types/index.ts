export interface SandwichAttack {
  victimTxHash: string;
  frontrunTxHash: string;
  backrunTxHash: string;
  attackerAddress: string;
  victimLossUSD: string;
  attackerProfitUSD: string;
  blockNumber: number;
  timestamp: number;
}

export interface MEVScanResult {
  walletAddress: string;
  ensName?: string;
  totalTransactions: number;
  attackedTransactions: number;
  totalLossUSD: string;
  attacks: SandwichAttack[];
  scanTimestamp: number;
}

export interface TransactionAnalysis {
  txHash: string;
  blockNumber: number;
  isMEVAttack: boolean;
  attackType: 'sandwich' | 'frontrun' | 'backrun' | 'none';
  attack?: SandwichAttack;
  aiExplanation?: string;
  recommendations?: string[];
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export const DEX_ROUTERS: Record<string, string> = {
  UNISWAP_V2: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
  UNISWAP_V3: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
  UNISWAP_UNIVERSAL: '0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD',
  SUSHISWAP: '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F',
};
