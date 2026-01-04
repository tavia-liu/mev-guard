export interface SwapTransaction {
  hash: string;
  blockNumber: number;
  timestamp: string;
  from: string;
  to: string;
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  amountOut: string;
}

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

// Uniswap V2/V3 Swap event signatures
export const SWAP_SIGNATURES = {
  // Uniswap V2 Swap(address,uint256,uint256,uint256,uint256,address)
  UNISWAP_V2: '0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822',
  // Uniswap V3 Swap(address,address,int256,int256,uint160,uint128,int24)
  UNISWAP_V3: '0xc42079f94a6350d7e6235f29174924f928cc2ac818eb64fed8004e115fbcca67',
};

// Known token addresses for labeling
export const TOKENS: Record<string, string> = {
  '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': 'WETH',
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': 'USDC',
  '0xdac17f958d2ee523a2206206994597c13d831ec7': 'USDT',
  '0x6b175474e89094c44da98b954eedeac495271d0f': 'DAI',
  '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599': 'WBTC',
};
