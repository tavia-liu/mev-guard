import { Alchemy, Network } from 'alchemy-sdk';
import { SwapTransaction, SWAP_SIGNATURES, TOKENS } from '../types';

let alchemyInstance: Alchemy | null = null;

function getAlchemy(): Alchemy {
  if (!alchemyInstance) {
    alchemyInstance = new Alchemy({
      apiKey: process.env.ALCHEMY_API_KEY,
      network: Network.ETH_MAINNET,
    });
  }
  return alchemyInstance;
}

// Resolve ENS name to address
export async function resolveENS(ensName: string): Promise<string | null> {
  try {
    const alchemy = getAlchemy();
    const address = await alchemy.core.resolveName(ensName);
    console.log(`[ENS] Resolved ${ensName} -> ${address}`);
    return address;
  } catch (error) {
    console.error(`[ENS] Failed to resolve ${ensName}:`, error);
    return null;
  }
}

// Get token symbol from address
function getTokenSymbol(address: string): string {
  return TOKENS[address.toLowerCase()] || address.slice(0, 8);
}

// Find swap transactions by looking at Swap event logs
export async function findSwapTransactions(
  walletAddress: string,
  limit: number = 50
): Promise<SwapTransaction[]> {
  const alchemy = getAlchemy();
  const swaps: SwapTransaction[] = [];
  
  console.log(`[Scan] Looking for swaps for ${walletAddress}`);

  try {
    // Get recent transactions from this wallet
    const txHistory = await alchemy.core.getAssetTransfers({
      fromAddress: walletAddress,
      category: ['external' as any, 'erc20' as any],
      maxCount: 100,
      order: 'desc' as any,
      withMetadata: true,
    });

    console.log(`[Scan] Found ${txHistory.transfers.length} transfers`);

    // Check each transaction for Swap events
    const processedHashes = new Set<string>();
    
    for (const transfer of txHistory.transfers) {
      if (swaps.length >= limit) break;
      if (!transfer.hash || processedHashes.has(transfer.hash)) continue;
      processedHashes.add(transfer.hash);

      try {
        // Get transaction receipt to check logs
        const receipt = await alchemy.core.getTransactionReceipt(transfer.hash);
        if (!receipt) continue;

        // Look for Swap events in logs
        const hasSwap = receipt.logs.some(log => {
          const topic0 = log.topics[0];
          return topic0 === SWAP_SIGNATURES.UNISWAP_V2 || 
                 topic0 === SWAP_SIGNATURES.UNISWAP_V3;
        });

        if (hasSwap) {
          swaps.push({
            hash: transfer.hash,
            blockNumber: parseInt(transfer.blockNum, 16),
            timestamp: transfer.metadata?.blockTimestamp || new Date().toISOString(),
            from: walletAddress,
            to: transfer.to || '',
            tokenIn: transfer.asset || 'ETH',
            tokenOut: 'TOKEN',
            amountIn: String(transfer.value || 0),
            amountOut: '0',
          });
          console.log(`[Scan] Found swap: ${transfer.hash.slice(0, 10)}... in block ${parseInt(transfer.blockNum, 16)}`);
        }
      } catch (e) {
        // Skip failed receipt lookups
      }
    }

    console.log(`[Scan] Total swaps found: ${swaps.length}`);
    return swaps;
  } catch (error) {
    console.error('[Scan] Error finding swaps:', error);
    return [];
  }
}

// Analyze a block for sandwich attacks around a specific transaction
export async function analyzeBlockForSandwich(
  txHash: string,
  blockNumber: number
): Promise<{
  isSandwich: boolean;
  frontrunTx?: string;
  backrunTx?: string;
  attackerAddress?: string;
}> {
  const alchemy = getAlchemy();

  try {
    // Get the block with all transactions
    const block = await alchemy.core.getBlockWithTransactions(blockNumber);
    if (!block) return { isSandwich: false };

    // Find victim transaction index
    const txIndex = block.transactions.findIndex(
      tx => tx.hash.toLowerCase() === txHash.toLowerCase()
    );
    if (txIndex === -1) return { isSandwich: false };

    const victimTx = block.transactions[txIndex];

    // Get receipts for transactions before and after
    const txsBefore = block.transactions.slice(Math.max(0, txIndex - 5), txIndex);
    const txsAfter = block.transactions.slice(txIndex + 1, txIndex + 6);

    // Look for matching patterns (same sender doing swap before and after)
    for (const beforeTx of txsBefore) {
      // Skip if same sender as victim
      if (beforeTx.from.toLowerCase() === victimTx.from.toLowerCase()) continue;

      for (const afterTx of txsAfter) {
        // Check if same address made transactions before and after
        if (beforeTx.from.toLowerCase() === afterTx.from.toLowerCase()) {
          // Verify both are swap transactions
          const [beforeReceipt, afterReceipt] = await Promise.all([
            alchemy.core.getTransactionReceipt(beforeTx.hash),
            alchemy.core.getTransactionReceipt(afterTx.hash),
          ]);

          const beforeHasSwap = beforeReceipt?.logs.some(log => 
            log.topics[0] === SWAP_SIGNATURES.UNISWAP_V2 || 
            log.topics[0] === SWAP_SIGNATURES.UNISWAP_V3
          );
          const afterHasSwap = afterReceipt?.logs.some(log => 
            log.topics[0] === SWAP_SIGNATURES.UNISWAP_V2 || 
            log.topics[0] === SWAP_SIGNATURES.UNISWAP_V3
          );

          if (beforeHasSwap && afterHasSwap) {
            console.log(`[Sandwich] Detected! Attacker: ${beforeTx.from.slice(0, 10)}...`);
            return {
              isSandwich: true,
              frontrunTx: beforeTx.hash,
              backrunTx: afterTx.hash,
              attackerAddress: beforeTx.from,
            };
          }
        }
      }
    }

    return { isSandwich: false };
  } catch (error) {
    console.error('[Sandwich] Analysis error:', error);
    return { isSandwich: false };
  }
}
