import { Alchemy, Network, AssetTransfersCategory } from 'alchemy-sdk';
import { DEX_ROUTERS } from '../types';

const getAlchemy = (network: 'ethereum' | 'base' = 'ethereum') => {
  return new Alchemy({
    apiKey: process.env.ALCHEMY_API_KEY,
    network: network === 'ethereum' ? Network.ETH_MAINNET : Network.BASE_MAINNET,
  });
};

export async function resolveENS(ensName: string): Promise<string | null> {
  const alchemy = getAlchemy('ethereum');
  return alchemy.core.resolveName(ensName);
}

export async function getWalletTransfers(address: string, network: 'ethereum' | 'base' = 'ethereum') {
  const alchemy = getAlchemy(network);
  
  const [outgoing, incoming] = await Promise.all([
    alchemy.core.getAssetTransfers({
      fromAddress: address,
      category: [AssetTransfersCategory.ERC20, AssetTransfersCategory.EXTERNAL],
      withMetadata: true,
      maxCount: 100,
    }),
    alchemy.core.getAssetTransfers({
      toAddress: address,
      category: [AssetTransfersCategory.ERC20, AssetTransfersCategory.EXTERNAL],
      withMetadata: true,
      maxCount: 100,
    }),
  ]);

  return { outgoing: outgoing.transfers, incoming: incoming.transfers };
}

export async function getTransaction(txHash: string, network: 'ethereum' | 'base' = 'ethereum') {
  const alchemy = getAlchemy(network);
  const [tx, receipt] = await Promise.all([
    alchemy.core.getTransaction(txHash),
    alchemy.core.getTransactionReceipt(txHash),
  ]);
  return { tx, receipt };
}

export async function getBlockTransactions(blockNumber: number, network: 'ethereum' | 'base' = 'ethereum') {
  const alchemy = getAlchemy(network);
  const block = await alchemy.core.getBlockWithTransactions(blockNumber);
  return block.transactions;
}

export function isDEXTransaction(toAddress: string | null): boolean {
  if (!toAddress) return false;
  const dexAddresses = Object.values(DEX_ROUTERS).map(a => a.toLowerCase());
  return dexAddresses.includes(toAddress.toLowerCase());
}

export async function findSandwichContext(txHash: string, network: 'ethereum' | 'base' = 'ethereum') {
  const { tx: victimTx } = await getTransaction(txHash, network);
  if (!victimTx?.blockNumber) throw new Error('Transaction not found');

  const blockTxs = await getBlockTransactions(victimTx.blockNumber, network);
  const victimIndex = blockTxs.findIndex(t => t.hash === txHash);

  const frontruns = blockTxs.slice(0, victimIndex).filter(tx => 
    isDEXTransaction(tx.to) && tx.from !== victimTx.from
  );
  
  const backruns = blockTxs.slice(victimIndex + 1).filter(tx => 
    isDEXTransaction(tx.to) && tx.from !== victimTx.from
  );

  return {
    victimTx,
    victimIndex,
    blockNumber: victimTx.blockNumber,
    totalTxsInBlock: blockTxs.length,
    frontruns: frontruns.map(tx => ({ hash: tx.hash, from: tx.from })),
    backruns: backruns.map(tx => ({ hash: tx.hash, from: tx.from })),
  };
}
