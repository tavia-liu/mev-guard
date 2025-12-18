# Deploying the Contract

## Prerequisites
- Install Foundry: `curl -L https://foundry.paradigm.xyz | bash`
- Run `foundryup`

## Setup
```bash
cd contracts
cp .env.example .env
# Edit .env with your keys
```

## Deploy to Base Sepolia (Testnet)
```bash
source .env
forge create --rpc-url $BASE_SEPOLIA_RPC_URL \
  --private-key $PRIVATE_KEY \
  src/MEVAttestation.sol:MEVAttestation \
  --verify --etherscan-api-key $BASESCAN_API_KEY
```

## Verify Contract
```bash
forge verify-contract <DEPLOYED_ADDRESS> \
  src/MEVAttestation.sol:MEVAttestation \
  --chain base-sepolia \
  --etherscan-api-key $BASESCAN_API_KEY
```
