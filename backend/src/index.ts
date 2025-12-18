import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { scanRoutes } from './routes/scan';
import { transactionRoutes } from './routes/transaction';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }));
app.use(express.json());

app.get('/health', (_, res) => res.json({ status: 'ok' }));

app.get('/api', (_, res) => res.json({
  endpoints: [
    'GET /api/scan/:address',
    'GET /api/scan/ens/:name',
    'GET /api/transaction/:hash',
    'GET /api/transaction/:hash/context',
  ]
}));

app.use('/api/scan', scanRoutes);
app.use('/api/transaction', transactionRoutes);

app.listen(PORT, () => {
  console.log(`MEV Guard API running on http://localhost:${PORT}`);
});
