import { SandwichAttack, MEVScanResult, TransactionAnalysis } from '../types';
import { findSandwichContext, getWalletTransfers, isDEXTransaction, getTransaction } from './alchemy';
import { analyzeAttack } from './ai';

export async function detectSandwich(
  txHash: string,
  network: 'ethereum' | 'base' = 'ethereum'
): Promise<TransactionAnalysis> {
  const context = await findSandwichContext(txHash, network);
  
  // Find matching frontrun/backrun from same address
  const matchingPairs = context.frontruns.filter(fr =>
    context.backruns.some(br => br.from.toLowerCase() === fr.from.toLowerCase())
  );

  if (matchingPairs.length > 0) {
    const attacker = matchingPairs[0];
    const backrun = context.backruns.find(
      br => br.from.toLowerCase() === attacker.from.toLowerCase()
    )!;

    // Get AI analysis
    let aiResult = { explanation: '', recommendations: [] as string[] };
    try {
      aiResult = await analyzeAttack({
        victimTxHash: txHash,
        blockNumber: context.blockNumber,
        victimAddress: context.victimTx.from,
        frontrunHash: attacker.hash,
        backrunHash: backrun.hash,
        attackerAddress: attacker.from,
      });
    } catch (e) {
      console.error('AI analysis failed:', e);
    }

    return {
      txHash,
      blockNumber: context.blockNumber,
      isMEVAttack: true,
      attackType: 'sandwich',
      attack: {
        victimTxHash: txHash,
        frontrunTxHash: attacker.hash,
        backrunTxHash: backrun.hash,
        attackerAddress: attacker.from,
        victimLossUSD: '0', // Would need price data to calculate
        attackerProfitUSD: '0',
        blockNumber: context.blockNumber,
        timestamp: Date.now(),
      },
      aiExplanation: aiResult.explanation,
      recommendations: aiResult.recommendations,
    };
  }

  return {
    txHash,
    blockNumber: context.blockNumber,
    isMEVAttack: false,
    attackType: 'none',
  };
}

export async function scanWallet(
  address: string,
  network: 'ethereum' | 'base' = 'ethereum',
  limit: number = 20
): Promise<MEVScanResult> {
  const transfers = await getWalletTransfers(address, network);
  
  // Get unique tx hashes that interacted with DEXs
  const txHashes = new Set<string>();
  [...transfers.outgoing, ...transfers.incoming].forEach(t => {
    if (t.hash) txHashes.add(t.hash);
  });

  const dexTxHashes: string[] = [];
  for (const hash of txHashes) {
    if (dexTxHashes.length >= limit) break;
    try {
      const { tx } = await getTransaction(hash, network);
      if (tx && isDEXTransaction(tx.to)) {
        dexTxHashes.push(hash);
      }
    } catch {
      // Skip failed lookups
    }
  }

  const attacks: SandwichAttack[] = [];
  
  for (const hash of dexTxHashes) {
    try {
      const analysis = await detectSandwich(hash, network);
      if (analysis.isMEVAttack && analysis.attack) {
        attacks.push(analysis.attack);
      }
      await new Promise(r => setTimeout(r, 200)); // Rate limit
    } catch (e) {
      console.error(`Error analyzing ${hash}:`, e);
    }
  }

  return {
    walletAddress: address,
    totalTransactions: dexTxHashes.length,
    attackedTransactions: attacks.length,
    totalLossUSD: '0',
    attacks,
    scanTimestamp: Date.now(),
  };
}
