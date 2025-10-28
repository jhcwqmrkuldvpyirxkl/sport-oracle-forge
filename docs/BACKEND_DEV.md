# SportOracle Backend Development Guide

## 概述
`SportOracleBook` 合约为体育竞猜提供密态下注、奖池累积与赛果结算。所有用户选择与下注金额以 FHE 加密提交，链上仅操纵密文并在赛果揭晓后通过网关解密发放奖金。

## 角色权限
- `DEFAULT_ADMIN_ROLE`：可配置赛事源、授予其他角色。
- `MARKET_MAKER_ROLE`：创建、结算竞猜市场。
- `ORACLE_ROLE`：写入比赛最终赛果。
- `GATEWAY_ROLE`：唯一允许的网关回调账号。

## 存储结构
### `Market`
- `uint256 marketId`
- `uint8 outcomeCount`
- `uint256 startTime`
- `uint256 lockTime`
- `bool settled`
- `uint8 winningOutcome`
- `euint64 encryptedPool`

### `BetTicket`
- `address bettor`
- `uint256 marketId`
- `externalEuint32 encryptedOutcome`
- `externalEuint64 encryptedStake`
- `bytes32 commitment`
- `bool claimed`

此外为每个市场维护 `euint64[] encryptedOutcomeTotals`，记录各选项奖池密文总额。

## 事件
- `MarketCreated(uint256 indexed marketId, uint8 outcomeCount)`
- `BetPlaced(uint256 indexed marketId, address indexed bettor)`
- `MarketSettled(uint256 indexed marketId, uint8 winningOutcome, uint256 requestId)`
- `PayoutClaimed(uint256 indexed ticketId, address indexed bettor, uint64 decryptedAmount)`

## 核心函数

### `createMarket`
```solidity
function createMarket(uint256 marketId, uint8 outcomeCount, uint256 startTime, uint256 lockTime) external onlyRole(MARKET_MAKER_ROLE)
```
- 初始化 `encryptedPool` 和 `encryptedOutcomeTotals[i]` 为 `FHE.asEuint64(0)`。
- 记录市场时段，防止锁定后继续下注。

### `placeBet`
```solidity
function placeBet(uint256 marketId, externalEuint32 encryptedOutcome, externalEuint64 encryptedStake, bytes calldata proof, bytes32 commitment) external
```
- 验证市场未锁定且 commitment 未使用。
- 导入密文：
  ```solidity
  euint32 outcome = FHE.fromExternal(encryptedOutcome, proof);
  euint64 stake = FHE.fromExternal(encryptedStake, proof);
  FHE.allowThis(outcome);
  FHE.allowThis(stake);
  ```
- 使用 `FHE.add` 更新 `encryptedPool` 与对应 outcome 的奖池总额。
- 保存 `BetTicket` 结构，commitment 用于去重。

### `settleMarket`
```solidity
function settleMarket(uint256 marketId, uint8 winningOutcome) external onlyRole(ORACLE_ROLE)
```
- 写入赛果并标记 `settled = true`。
- 计算胜方奖金比率：`encryptedPool / encryptedOutcomeTotals[winningOutcome]` 通过 Division Invariance（前端金额预乘 1e6）。
- 生成解密请求：
  ```solidity
  euint64 payoutRatio = ...; // 明文乘积缩放后除以常量
  uint256 requestId = gateway.requestDecryption(
      uint256(euint64.unwrap(payoutRatio)),
      address(this),
      block.timestamp,
      false,
      false
  );
  emit MarketSettled(marketId, winningOutcome, requestId);
  ```

### `claimPayout`
```solidity
function claimPayout(uint256 ticketId, bytes calldata proofOutcome, bytes calldata proofStake) external
```
- 导入下注密文并验证 outcome 与 winningOutcome 一致，失败则发放 0。
- 使用 `FHE.mul`、`FHE.div` 计算奖金，最终允许网关回调金额给用户。
- 设置 `ticket.claimed = true`。

### `gatewayCallback`
```solidity
function gatewayCallback(uint256 requestId, uint64 decryptedAmount, address bettor) external onlyRole(GATEWAY_ROLE)
```
- 将解密奖金发送给 `bettor`，记录事件 `PayoutClaimed`。

## FHE 流程要点
- 下注 outcome 使用 `externalEuint32`，stake 使用 `externalEuint64`。
- 计算赔付时采用固定倍数（如 `SCALE = 1e6`）确保除法可用：所有 stake 先乘 SCALE，再除以胜方奖池总额。
- 每次 `FHE.fromExternal` 后立刻 `FHE.allowThis`，并在需要发放奖金给用户时 `FHE.allow(cipher, bettor)`。

## Solidity 骨架
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { FHE, euint32, euint64, externalEuint32, externalEuint64 } from "@fhevm/solidity/lib/FHE.sol";

contract SportOracleBook is AccessControl {
    bytes32 public constant MARKET_MAKER_ROLE = keccak256("MARKET_MAKER_ROLE");
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");
    bytes32 public constant GATEWAY_ROLE = keccak256("GATEWAY_ROLE");

    struct Market {
        euint64 encryptedPool;
        euint64[] encryptedOutcomeTotals;
        bool settled;
        uint8 winningOutcome;
    }

    mapping(uint256 => Market) public markets;

    constructor(address admin, address gateway) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MARKET_MAKER_ROLE, admin);
        _grantRole(GATEWAY_ROLE, gateway);
    }
}
```

## Hardhat 配置
```ts
import { defineConfig } from "hardhat/config";
import "@fhevm/hardhat-plugin";
import "@nomicfoundation/hardhat-toolbox";

export default defineConfig({
  solidity: "0.8.24",
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL!,
      accounts: [process.env.PRIVATE_KEY!],
    },
  },
  fhEVM: {
    gatewayUrl: process.env.FHE_GATEWAY_URL!,
  },
});
```

## 测试计划
- **下注流程**：确保 commitment 唯一，重复提交应 revert。
- **奖池累积**：多名用户下注后，验证池子密文在逻辑上增加。
- **结算逻辑**：测试不同 outcome 胜出时的密态运算正确性。
- **回调安全**：模拟非网关地址调用 `gatewayCallback` 必须被拒绝。

## 部署与运维
1. 部署后运行 `scripts/seed-markets.ts` 初始化演示市场。
2. 授予数据源签名人 `ORACLE_ROLE`。
3. 配置后端监听 `MarketSettled` 与 `PayoutClaimed` 事件同步前端票据状态。

## 安全考量
- 加密金额须经过前端范围校验，服务器端也应设置最大下注限制。
- 市场结算前锁定下注窗口，避免赛果公开后下注。
- 网关回调应包含 `ticketId` 与 `bettor`，以免错误转账。
