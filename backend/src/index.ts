import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { scanRoutes } from './routes/scan';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (_, res) => res.json({ status: 'ok' }));

// API routes
app.use('/api/scan', scanRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`\n🛡️  MEV Guard API v2.0`);
  console.log(`   Running on: http://localhost:${PORT}`);
  console.log(`   Alchemy: ${process.env.ALCHEMY_API_KEY ? '✓' : '✗ MISSING'}`);
  console.log(`   Anthropic: ${process.env.ANTHROPIC_API_KEY ? '✓' : '○ Optional'}\n`);
});
