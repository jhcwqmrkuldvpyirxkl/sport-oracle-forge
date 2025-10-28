# SportOracle – Encrypted Sports Prediction Exchange

SportOracle is an end-to-end privacy-preserving sports prediction market built on Zama fhEVM. The `SportOracleBook` contract handles encrypted betting, pool accumulation, outcome settlement, and payout decryption. The frontend provides a React + RainbowKit experience, using `@zama-fhe/relayer-sdk` to generate ciphertext locally in the browser and broadcast it on-chain.

**中文**: SportOracle 是一个端到端的隐私友好型体育预测市场，基于 Zama fhEVM。合约 `SportOracleBook` 负责密态下注、奖池累积、赛果结算与奖金解密；前端提供 React + RainbowKit 体验，使用 `@zama-fhe/relayer-sdk` 在浏览器本地生成密文并广播到链上。

## Key Features

- **🔒 Fully Encrypted Betting**: User predictions and stake amounts are encrypted client-side
- **🎯 Fair Settlement**: Oracle-based outcome resolution with encrypted pools
- **💰 Automated Payouts**: Gateway-decrypted payout calculations
- **🎨 Modern UI**: React-based DApp with RainbowKit wallet integration
- **✅ Comprehensive Tests**: Full test coverage for encrypted betting lifecycle

## Architecture

| Layer | Description |
| --- | --- |
| **Smart Contracts** | `backend/contracts/SportOracleBook.sol` (Solidity 0.8.24)。使用 `@fhevm/solidity`、AccessControl、Gateway 回调，支持密态奖池与 payout ratio 解密。|
| **Hardhat Tooling** | `backend/hardhat.config.ts` 固化 Cancun + fhEVM 插件，提供 `npm run test`, `npm run deploy:*`, `scripts/seed-markets.ts`。|
| **Frontend** | Vite + React + TypeScript。Wagmi + RainbowKit 钱包连接，React Query 读取合约市场列表，`src/lib/fhe.ts` 中的 SDK/Mock 负责密文生成。|
| **E2E Validation** | Playwright (`tests/e2e/app.spec.ts`) 启动本地 Vite 实例，验证落地页叙述 & BetSlip 的无钱包提示。|

## Backend

```bash
cd backend
npm install
npm run build          # hardhat compile
npm test               # fhEVM Hardhat tests (requires mock mode)
```

Environment (`.env` in project root):
```bash
# Deployer account
ADDRESS=0xba677C2841F1215dF3287EaAf4ceB7565b8a5061
PRIVATE_KEY=0x...

# Network configuration
SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com

# Optional: Zama Gateway (defaults to deployer if not set)
GATEWAY_ADDRESS=0x...
```

Deployment workflow:
```bash
# 1. Deploy contract to Sepolia
npm run deploy:sepolia

# 2. Export ABI to frontend
npm run export-abi

# 3. Seed demo markets
npm run seed:sepolia

# 4. Verify on Etherscan
npm run verify
```

## Frontend

```bash
npm install
npm run dev
npm run build
```

Environment variables (`.env` in project root):
```bash
# Contract address (auto-filled by deployment script)
VITE_CONTRACT_ADDRESS=0x...

# Network configuration
VITE_SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
VITE_SEPOLIA_CHAIN_ID=11155111

# WalletConnect (optional, defaults to "demo")
VITE_WALLETCONNECT_PROJECT_ID=demo
```

**FHE SDK Integration**: `src/lib/fhe.ts` provides dynamic SDK loading with automatic mock fallback when WASM/COOP headers are unavailable, ensuring compatibility with development and Playwright testing.

**COOP/COEP Headers**: Configured in `vite.config.ts` to enable SharedArrayBuffer support required by FHE SDK:
```typescript
headers: {
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Embedder-Policy': 'require-corp',
}
```

## Testing

| Suite | Command | Notes |
| --- | --- | --- |
| Hardhat unit | `npm run test` (inside `backend`) | Validates encrypted pooling, settlement, payout callbacks with mock signatures |
| Playwright E2E | `npx playwright test` | 启动 dev server + Chromium，无钱包场景校验 UI & 错误提示 |

## Deployment Notes

- **Smart contract**: deploy via Hardhat script; keep `MARKET_MAKER_ROLE`, `ORACLE_ROLE`, `GATEWAY_ROLE` addresses aligned with fhEVM gateway.
- **Front-end on Vercel**: requires Vercel project + org IDs besides token (not included in repo secrets). Run `npx vercel deploy --token $VERCEL_TOKEN --prod` from `projects/05_SportOracle`. Update `docs/50_FHE_Web3_Projects.csv` column `Link to the deployed demo` once URL is available.
- **Gateway**: ensure deployed contract is whitelisted by fhEVM gateway (Sepolia) and environment variables reference the same gateway URL.

## Project Structure

```
projects/05_SportOracle/
├── backend/                 # Hardhat workspace (contracts, scripts, tests)
├── src/                     # React sources (pages, components, hooks, lib)
├── tests/e2e/               # Playwright specs
├── playwright.config.ts
├── package.json             # Frontend dependencies + scripts
└── README.md                # (this file)
```

## Development Workflow

1. **Contract Development**: Modify Solidity contracts in `backend/contracts/` and run `npm run build` to regenerate TypeChain types
2. **ABI Export**: Run `npm run export-abi` from backend directory to update frontend ABI
3. **Frontend Integration**: Use `useMarketsQuery` (React Query) + Wagmi to read contract state. Add new contract calls in `src/lib/contracts.ts`
4. **FHE Encryption**: Call `encryptBetPayload` to create encrypted inputs before contract mutations
5. **Testing**: Run `npm test` (backend) and verify frontend functionality before deployment

## Quick Start

```bash
# Install dependencies
cd backend && npm install
cd .. && npm install

# Compile contracts
cd backend && npm run build

# Run tests
npm test

# Start development server
cd .. && npm run dev
```

Access at: http://localhost:8080

## Compliance Checklist

- Solidity 0.8.24 + fhEVM Cancun config ✅
- Imports: `@fhevm/solidity/lib/FHE.sol`, `@zama-fhe/relayer-sdk/bundle` ✅
- Gateway signatures verified via `FHE.checkSignatures` ✅
- Division invariance handled with SCALE (1e6) ✅
- Frontend uses WalletConnect v2 + RainbowKit, React Query, Zustand state per docs ✅
- Tests exercise encrypted lifecycle + UI gating ✅
