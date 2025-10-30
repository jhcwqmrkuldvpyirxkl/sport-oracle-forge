# SportOracle

**Encrypted Sports Prediction Market powered by Zama fhEVM**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.24-blue)](https://soliditylang.org/)
[![Hardhat](https://img.shields.io/badge/Built%20with-Hardhat-yellow)](https://hardhat.org/)

---

## 🎯 Overview

SportOracle is a decentralized prediction market for sports events that leverages **Fully Homomorphic Encryption (FHE)** to keep bets private on-chain. Users can place encrypted wagers on sports outcomes, and the system ensures:

- 🔐 **Privacy**: Bet amounts and predictions remain encrypted until settlement
- 🎲 **Fairness**: No one can see bet distributions before market locks
- 💰 **Transparency**: Payouts are calculated on-chain after decryption
- ⛓️ **Trustless**: All operations verified by smart contracts

---

## 🏗️ Architecture

### Smart Contracts

- **SportOracleBook.sol**: Main betting contract with FHE operations
  - Market creation and management
  - Encrypted bet placement
  - Oracle-based settlement
  - Automated payout distribution

### Frontend

- **React** + **TypeScript** + **Vite**
- **Wagmi v2** + **RainbowKit** for wallet connection
- **Zama FHE SDK** for client-side encryption
- **TailwindCSS** + **shadcn/ui** for styling

---

## 🚀 Quick Start

### Prerequisites

- Node.js v18+
- MetaMask browser extension
- Sepolia ETH for testing (get from [faucets](#getting-test-eth))

### Installation

```bash
# Clone repository
git clone <your-repo-url>
cd SportOracle

# Install dependencies
npm install
cd backend && npm install && cd ..

# Configure environment
cp .env.example .env
# Edit .env with your PRIVATE_KEY and RPC URLs
```

### Environment Variables

Create a `.env` file in the project root:

```bash
# Deployment
PRIVATE_KEY=your_private_key_here
SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com

# Frontend
VITE_CONTRACT_ADDRESS=<deployed_contract_address>
VITE_SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
VITE_SEPOLIA_CHAIN_ID=11155111
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_id
```

---

## 📦 Deployment

### 1. Check Balance

```bash
cd backend
npx hardhat run scripts/check-sepolia-balance.ts --network sepolia
```

### 2. Deploy Contract

```bash
npx hardhat run scripts/deploy-to-sepolia.ts --network sepolia

```

This will:
- Deploy `SportOracleBook` contract
- Configure admin roles
- Update `.env` with contract address
- Save deployment info to `backend/deployments/sepolia.json`

### 3. Create Test Markets

```bash
npx hardhat run scripts/seed-sepolia-markets.ts --network sepolia
```

Creates 3 demo markets:
- **Market 1001**: Premier League match (3 outcomes)
- **Market 1002**: La Liga match (3 outcomes)
- **Market 1003**: NBA match (2 outcomes)

### 4. Start Frontend

```bash
npm run dev
```

Visit **http://localhost:8080** and connect your wallet!

---

## 🎮 Usage

### For Bettors

1. **Connect Wallet**
   - Click "Connect Wallet"
   - Select MetaMask
   - Switch to Sepolia network

2. **Place Encrypted Bet**
   - Browse available markets
   - Select your prediction
   - Enter stake amount (e.g., 0.001 ETH)
   - Click "Place Encrypted Bet"
   - Wait for FHE encryption (~5-10 sec)
   - Confirm MetaMask transaction

3. **View Bet History**
   - Check bet history table
   - Click transaction hash to view on Etherscan

---

## 📁 Project Structure

```
SportOracle/
├── backend/
│   ├── contracts/
│   │   └── SportOracleBook.sol      # Main betting contract
│   ├── scripts/
│   │   ├── check-sepolia-balance.ts # Check ETH balance
│   │   ├── deploy-to-sepolia.ts     # Deploy to Sepolia
│   │   ├── seed-sepolia-markets.ts  # Create demo markets
│   │   ├── deploy-to-local.ts       # Local deployment
│   │   ├── seed-local-markets.ts    # Local markets
│   │   ├── test-local-betting.ts    # Local testing
│   │   ├── export-abi.ts            # Export contract ABI
│   │   └── verify-contract.ts       # Verify on Etherscan
│   ├── deployments/
│   │   └── sepolia.json             # Deployment info
│   ├── hardhat.config.ts            # Hardhat configuration
│   └── package.json
├── src/
│   ├── components/                  # React components
│   ├── hooks/                       # Custom React hooks
│   ├── lib/                         # Utilities & FHE SDK
│   ├── pages/                       # Page components
│   ├── providers/                   # Context providers
│   └── store/                       # Zustand state management
├── docs/                            # Documentation
│   ├── BACKEND_DEV.md
│   └── FRONTEND_DEV.md
├── tests/                           # E2E tests
│   ├── e2e/
│   └── reports/
├── .env                             # Environment variables
├── package.json
├── vite.config.ts                   # Vite configuration
└── README.md                        # This file
```

---

## 🔗 Deployed Contracts

### Sepolia Testnet

| Contract | Address | Etherscan |
|----------|---------|-----------|
| SportOracleBook | `0x08Dff01a750051dDb5E46b3c9f509A62FD677D94` | [View](https://sepolia.etherscan.io/address/0x08Dff01a750051dDb5E46b3c9f509A62FD677D94) |

---

## 💸 Getting Test ETH

Get Sepolia ETH from these faucets:

- **Alchemy Faucet**: https://www.alchemy.com/faucets/ethereum-sepolia
- **Sepolia Faucet**: https://sepoliafaucet.com/
- **Infura Faucet**: https://www.infura.io/faucet/sepolia

You'll need at least **0.05 ETH** for deployment and **0.01 ETH** for testing.

---

## 🛠️ Development

### Backend Development

```bash
cd backend

# Compile contracts
npx hardhat compile

# Run local node
npx hardhat node

# Deploy to local
npx hardhat run scripts/deploy-to-local.ts --network localhost

# Export ABI
npx hardhat run scripts/export-abi.ts
```

### Frontend Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 📖 Documentation

- **Zama fhEVM Docs**: https://docs.zama.ai/fhevm
- **Hardhat Docs**: https://hardhat.org/docs
- **Wagmi Docs**: https://wagmi.sh/
- **RainbowKit Docs**: https://www.rainbowkit.com/docs

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- **Zama** for the fhEVM technology
- **Ethereum Foundation** for Sepolia testnet
- **Hardhat** for the development environment
- **RainbowKit** for the wallet connection UI

---

**Built with ❤️ for the Zama Developer Program**

Bet privately. Win transparently. 🎲
