import { Router } from 'express';
import { scanWallet } from '../services/detector';

const router = Router();

// GET /api/scan/:addressOrENS
router.get('/:addressOrENS', async (req, res) => {
  const { addressOrENS } = req.params;
  const limit = Math.min(parseInt(req.query.limit as string) || 30, 50);

  console.log(`[API] Scan request: ${addressOrENS}, limit=${limit}`);

  // Basic validation
  const isENS = addressOrENS.toLowerCase().endsWith('.eth');
  const isAddress = /^0x[a-fA-F0-9]{40}$/i.test(addressOrENS);

  if (!isENS && !isAddress) {
    return res.status(400).json({
      success: false,
      error: 'Invalid input. Please enter a valid Ethereum address (0x...) or ENS name (*.eth)',
    });
  }

  try {
    const result = await scanWallet(addressOrENS, limit);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('[API] Scan error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Scan failed',
    });
  }
});

export { router as scanRoutes };
