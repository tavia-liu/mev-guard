import { Router } from 'express';
import { detectSandwich } from '../services/detector';
import { findSandwichContext } from '../services/alchemy';
import { APIResponse, TransactionAnalysis } from '../types';

const router = Router();

// GET /api/transaction/:hash
router.get('/:hash', async (req, res) => {
  const { hash } = req.params;
  const network = (req.query.network as 'ethereum' | 'base') || 'ethereum';

  if (!/^0x[a-fA-F0-9]{64}$/.test(hash)) {
    return res.status(400).json({ success: false, error: 'Invalid tx hash' });
  }

  try {
    const analysis = await detectSandwich(hash, network);
    const response: APIResponse<TransactionAnalysis> = {
      success: true,
      data: analysis,
    };
    res.json(response);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Analysis failed' 
    });
  }
});

// GET /api/transaction/:hash/context
router.get('/:hash/context', async (req, res) => {
  const { hash } = req.params;
  const network = (req.query.network as 'ethereum' | 'base') || 'ethereum';

  if (!/^0x[a-fA-F0-9]{64}$/.test(hash)) {
    return res.status(400).json({ success: false, error: 'Invalid tx hash' });
  }

  try {
    const context = await findSandwichContext(hash, network);
    res.json({ success: true, data: context });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to get context' 
    });
  }
});

export { router as transactionRoutes };
