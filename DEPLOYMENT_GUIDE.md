# SportOracle Deployment Guide

## Overview
SportOracle is a fully homomorphic encrypted (FHE) sports prediction exchange built on Zama fhEVM. This guide covers the complete deployment and testing process.

## Prerequisites

### Required Tools
- Node.js v20+ and npm
- Git
- Sepolia testnet ETH (for deployer account)
- WalletConnect Project ID
- Etherscan API Key (for contract verification)

### Account Setup
- **Deployer Address**: `0xba677C2841F1215dF3287EaAf4ceB7565b8a5061`
- **Private Key**: Configured in `.env`
- **Required Balance**: ~0.01 Sepolia ETH for deployment

## Project Structure

```
projects/05_SportOracle/
├── backend/                      # Hardhat contracts
│   ├── contracts/                # Solidity contracts
│   │   └── SportOracleBook.sol  # Main FHE betting contract
│   ├── scripts/                  # Deployment & utility scripts
│   │   ├── deploy.ts            # Main deployment script
│   │   ├── seed-markets.ts      # Create demo markets
│   │   ├── verify-contract.ts   # Etherscan verification
│   │   └── export-abi.ts        # Export ABI to frontend
│   ├── test/                     # Contract tests
│   └── hardhat.config.ts         # Hardhat configuration
├── src/                          # React frontend
│   ├── components/               # UI components
│   ├── lib/                      # Utilities
│   │   ├── fhe.ts               # FHE SDK integration
│   │   └── contracts.ts         # Contract configuration
│   ├── pages/                    # Application pages
│   └── abi/                      # Contract ABIs
└── .env                          # Environment variables
```

## Step-by-Step Deployment

### 1. Fund Deployer Account

Get Sepolia ETH from faucets:
- **Alchemy Faucet**: https://sepoliafaucet.com/
- **Infura Faucet**: https://www.infura.io/faucet/sepolia
- **Chainlink Faucet**: https://faucets.chain.link/sepolia

Send at least **0.01 Sepolia ETH** to: `0xba677C2841F1215dF3287EaAf4ceB7565b8a5061`

### 2. Deploy Smart Contract

```bash
cd backend
npm run deploy:sepolia
```

This will:
- Deploy SportOracleBook contract
- Save contract address to `.env`
- Display next steps

Expected output:
```
========================================
  SportOracleBook Deployment
========================================
Network: sepolia
Deployer: 0xba677...5061
Admin: 0xba677...5061
Gateway: 0xba677...5061

✅ SportOracleBook deployed at: 0x...
✅ Updated VITE_CONTRACT_ADDRESS in .env file
```

### 3. Verify Contract on Etherscan

```bash
npm run verify
```

This verifies the contract source code on Etherscan for transparency.

### 4. Export ABI to Frontend

```bash
npm run export-abi
```

This copies the contract ABI to `src/abi/SportOracleBook.json` for frontend integration.

### 5. Seed Demo Markets

```bash
npm run seed:sepolia
```

This creates 3 demo sports markets for testing:
- Market 1001: 3 outcomes (Team A, Team B, Draw)
- Market 1002: 3 outcomes
- Market 1003: 2 outcomes (Team A, Team B)

### 6. Test Frontend Locally

```bash
cd ..  # Back to project root
npm run dev
```

Access the app at: http://localhost:8080

**Important**: The dev server includes COOP/COEP headers required for FHE SDK.

### 7. Test Complete Flow

1. **Connect Wallet**: Use MetaMask or other Web3 wallet
2. **Switch to Sepolia**: Ensure you're on Sepolia testnet
3. **Select Market**: Choose a market from the list
4. **Choose Outcome**: Pick Team A, Team B, or Draw
5. **Enter Stake**: Input bet amount in ETH
6. **Place Bet**: Click "Place Encrypted Bet"
7. **Confirm Transaction**: Approve in wallet

The bet data (outcome + stake) is encrypted client-side before submission!

## Contract Functions

### Admin Functions
- `createMarket(marketId, outcomeCount, startTime, lockTime)`: Create new market
- `settleMarket(marketId, winningOutcome)`: Settle market with winning outcome

### User Functions
- `placeBet(marketId, encryptedOutcome, encryptedStake, proof, commitment)`: Place encrypted bet
- `claimPayout(ticketId, inputProof)`: Claim winnings after settlement

### View Functions
- `getMarketIds()`: Get all market IDs
- `getMarket(marketId)`: Get market details
- `getTicket(ticketId)`: Get bet ticket details

## FHE Security Features

### Encrypted Data
- **Encrypted Outcome**: User's prediction (euint32)
- **Encrypted Stake**: Bet amount (euint64)
- **Encrypted Pool**: Total pool per outcome (euint64)

### ACL (Access Control List)
- Contract can read encrypted data via `FHE.allowThis()`
- Users need proof to decrypt their own data
- Winners determined through encrypted comparison

### Division Invariance
- Uses `SCALE = 1_000_000` to avoid precision loss
- Payout = (stake * payoutRatio) / SCALE

## Testing

### Backend Tests
```bash
cd backend
npm test
```

Tests cover:
- Market creation and settlement
- Encrypted bet placement
- Commitment uniqueness
- Access control
- Full betting lifecycle

### Manual Frontend Testing
1. Create multiple bets from different accounts
2. Settle market with oracle role
3. Claim payouts for winning bets
4. Verify encrypted data stays private

## Troubleshooting

### Issue: SDK Initialization Failed
**Solution**: Ensure COOP/COEP headers are set in `vite.config.ts`:
```typescript
headers: {
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Embedder-Policy': 'require-corp',
}
```

### Issue: Contract Address Not Found
**Solution**: Check `.env` file for `VITE_CONTRACT_ADDRESS` after deployment

### Issue: Transaction Failed
**Possible causes**:
- Insufficient Sepolia ETH balance
- Market already locked
- Duplicate commitment

### Issue: Encryption Fails
**Solution**: Verify FHE SDK version is exactly `0.2.0` in `package.json`

## Environment Variables

### Required for Deployment
```bash
ADDRESS=0xba677C2841F1215dF3287EaAf4ceB7565b8a5061
PRIVATE_KEY=0x...
SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
```

### Required for Frontend
```bash
VITE_CONTRACT_ADDRESS=0x...  # Filled by deployment script
VITE_SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
VITE_SEPOLIA_CHAIN_ID=11155111
VITE_WALLETCONNECT_PROJECT_ID=demo
```

### Optional
```bash
GATEWAY_ADDRESS=0x...  # Zama gateway for decryption callbacks
ETHERSCAN_API_KEY=...  # For contract verification
```

## Key Technical Decisions

### 1. FHE SDK Version
- **@zama-fhe/relayer-sdk**: Locked to `0.2.0` (required for Sepolia)
- **@fhevm/solidity**: `^0.8.0`

### 2. Solidity Version
- **Version**: `0.8.24` (required by fhEVM)
- **EVM**: Cancun

### 3. Wallet Configuration
- RainbowKit configured with `locale="en-US"` to avoid translation issues
- Coinbase connector disabled to prevent connection failures

### 4. Frontend Architecture
- **Vite + React**: Fast development with HMR
- **Wagmi v2**: Web3 state management
- **RainbowKit**: Wallet connection
- **TanStack Query**: Data fetching
- **Zustand**: Local state

## Security Checklist

- ✅ All user data encrypted client-side
- ✅ Commitment prevents replay attacks
- ✅ ACL ensures proper data access
- ✅ Fail-closed security: invalid data → revert
- ✅ Gateway signatures verified
- ✅ ReentrancyGuard on payout functions
- ✅ Role-based access control

## Next Steps After Local Testing

1. **User Confirmation**: Wait for user approval
2. **Push to GitHub**: Commit all changes
3. **Deploy to Vercel**: Use VERCEL_TOKEN
4. **Configure Domain**: Set up short link
5. **Update Documentation**: Add deployed link to CSV

## Support Resources

- **Zama Documentation**: https://docs.zama.ai/
- **fhEVM GitHub**: https://github.com/zama-ai/fhevm
- **Relayer SDK**: https://docs.zama.ai/fhevm/sdk/
- **Project Issues**: Contact project maintainer

---

**Last Updated**: 2025-10-28
**Version**: 1.0.0
**Status**: Ready for deployment (pending Sepolia ETH)
