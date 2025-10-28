# SportOracle Frontend Development Guide

## 概述
`sport-oracle-dapp` 面向体育竞猜用户提供包含赛事主页与下注控制台的双页面体验。界面采用动感赛场视觉，所有投注选项与金额在客户端通过 FHE SDK 加密后才会送入合约，确保投注隐私与公平性。

## 应用身份
- **App Name**: `sport-oracle-dapp`
- **Package Path**: `apps/sport-oracle-dapp`
- **Design System**: 主题 *Pulse Arena*，深蓝背景配鲜橙高亮，凸显实时激烈氛围。

| Token | Hex |
|-------|-----|
| Primary | `#0B1D3A` |
| Secondary | `#F97316` |
| Accent | `#22D3EE` |
| Surface | `#111C2E` |
| Background | `#030712` |
| Gradient | `linear-gradient(140deg, #0B1D3A 0%, #1E3A8A 55%, #F97316 100%)` |

## 技术栈
- Next.js 14 App Router + TypeScript
- Tailwind CSS + Motion One 动画打造实时数据滚动条
- Wagmi v2、RainbowKit (MetaMask、WalletConnect、Rainbow)
- TanStack Query 订阅赛事赔率 API 与链上事件
- Zustand 管理下注草稿与 SDK 状态
- `@zama-fhe/relayer-sdk/bundle` 负责 WASM 加载与密文生成
- Recharts 可视化赔率变化

## 布局与导航
- `app/layout.tsx` 注入 wagmi Provider、ThemeProvider、`EncryptionSnackbar`。
- 顶栏 `ArenaHeader`：展示实时比分 ticker、网络状态、连接钱包 CTA。
- 底栏 `LegalFooter`：列出隐私条款、赔率来源、反馈入口。

## 页面结构
- `/` — Landing 首页：赛事亮点、产品卖点、实时赛程组件、CTA “Start Predicting”。
- `/app` — 竞猜控制台：市场列表、盘口详情、下注面板、历史投注。
- `/app/tickets` — 个人票据中心：列出加密投注记录与解密结果。

## Landing 页面模块

### Hero Banner
- 文件：`components/landing/Hero.tsx`
- 内容：左侧标题、动态文字强调“Encrypt. Predict. Win.”，右侧使用 Canvas 渲染球场灯光。
- CTA：`Launch DApp` + `View Odds Feed`。

### LiveSchedule Strip
- 文件：`components/landing/LiveSchedule.tsx`
- 功能：滚动展示今日赛事，来源为 `sportsDataApi`。
- 互动：悬停显示赔率快照，点击跳转 `/app?matchId=`。

### Feature Triad
- 文件：`components/landing/Features.tsx`
- 三个特性：保密下注、自动结算、实时赔率。使用橙色线性高光卡片。

## DApp 核心模块

### MarketList
- 文件：`components/app/MarketList.tsx`
- 作用：展示可选赛事与盘口（胜负、比分、让分）。
- 数据：链上 `getActiveMarkets` + 外部 API 合并。

### BetSlipPanel
- 文件：`components/app/BetSlipPanel.tsx`
- 作用：用户选择盘口后输入金额并生成加密参数。
- 加密流程：
  ```typescript
  const fhe = await ensureFheInstance();
  const input = fhe.createEncryptedInput(contractAddress, walletAddress);
  input.add32(selectedOutcomeId);
  input.add64(parseEther(amount));
  const { handles, inputProof } = await input.encrypt();
  ```
- 事务：调用 `placeBet(marketId, handles[0], handles[1], inputProof)`。

### BetsHistoryTable
- 文件：`components/app/BetsHistoryTable.tsx`
- 展示：密态票据（标明“Encrypted”），当 `PayoutRevealed` 事件触发后显示解密金额。
- 视觉：暗色表格 + 橙色高亮行表示最近交易。

## FHE 集成工具
```typescript
import { initSDK, createInstance, SepoliaConfig } from "@zama-fhe/relayer-sdk/bundle";

let cachedInstance: Awaited<ReturnType<typeof createInstance>> | null = null;

export async function ensureFheInstance() {
  if (cachedInstance) return cachedInstance;
  await initSDK();
  cachedInstance = await createInstance(SepoliaConfig);
  return cachedInstance;
}

export async function encryptBetPayload(contractAddress: `0x${string}`, bettor: `0x${string}`, outcomeId: number, stakeWei: bigint) {
  const fhe = await ensureFheInstance();
  const input = fhe.createEncryptedInput(contractAddress, bettor);
  input.add32(outcomeId);
  input.add64(stakeWei);
  const { handles, inputProof } = await input.encrypt();
  return { outcomeHandle: handles[0], stakeHandle: handles[1], proof: inputProof };
}
```

## 状态与错误处理
- `useBetSlipStore` (Zustand)：记录当前选中盘口、下注金额、SDK 初始化状态。
- `useMarketsQuery`：每 15 秒重新拉取数据，侦听 `MarketSettled` 事件刷新。
- `EncryptionGuard`：若 SDK 初始化失败或浏览器缺少 COOP/COEP 头部，则阻断表单并显示指南。

## QA 与测试
- Jest 覆盖组件校验：金额上限、最小注额、钱包连接流程。
- Cypress E2E：模拟用户选择盘口、调用 `encryptBetPayload`，断言交易参数为十六进制密文。
- 可用性测试：确保移动端下 BetSlip 折叠交互顺畅。
