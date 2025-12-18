# MEV Guard

AI-powered MEV attack detector and loss tracker for Ethereum wallets.

## Quick Start

```bash
# Backend
cd backend
cp .env.example .env  # Add your API keys
npm install
npm run dev

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

Open http://localhost:3000

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| GET /api/scan/:address | Scan wallet for MEV attacks |
| GET /api/scan/ens/:name | Scan by ENS name |
| GET /api/transaction/:hash | Analyze single transaction |

## Tech Stack

- Backend: Node.js, Express, TypeScript, Alchemy SDK
- Frontend: React, TypeScript, TailwindCSS
- AI: Claude Sonnet 4.5
- Contracts: Solidity (Base testnet)

## License

MIT
