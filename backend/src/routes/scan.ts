import { Router } from 'express';
import { scanWallet } from '../services/detector';
import { resolveENS } from '../services/alchemy';
import { generateReport } from '../services/ai';
import { APIResponse, MEVScanResult } from '../types';

const router = Router();

// GET /api/scan/:address
router.get('/:address', async (req, res) => {
  const { address } = req.params;
  const network = (req.query.network as 'ethereum' | 'base') || 'ethereum';
  const limit = parseInt(req.query.limit as string) || 20;

  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return res.status(400).json({ success: false, error: 'Invalid address' });
  }

  try {
    const result = await scanWallet(address, network, limit);
    
    // Generate AI report if attacks found
    let aiReport: string | undefined;
    if (result.attackedTransactions > 0) {
      try {
        aiReport = await generateReport(result);
      } catch {
        // AI report is optional
      }
    }

    const response: APIResponse<MEVScanResult & { aiReport?: string }> = {
      success: true,
      data: { ...result, aiReport },
    };
    res.json(response);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Scan failed' 
    });
  }
});

// GET /api/scan/ens/:name
router.get('/ens/:name', async (req, res) => {
  const { name } = req.params;
  const network = (req.query.network as 'ethereum' | 'base') || 'ethereum';

  try {
    const address = await resolveENS(name);
    if (!address) {
      return res.status(404).json({ success: false, error: 'ENS not found' });
    }

    const result = await scanWallet(address, network, 20);
    const response: APIResponse<MEVScanResult> = {
      success: true,
      data: { ...result, ensName: name },
    };
    res.json(response);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Scan failed' 
    });
  }
});

export { router as scanRoutes };
