import { config as loadEnv } from "dotenv";
import { resolve } from "path";
import { ethers } from "hardhat";
import type { SportOracleBook } from "../types";

loadEnv({ path: resolve(__dirname, "..", ".env") });

interface MarketSeed {
  marketId: number;
  outcomeCount: number;
  startDelaySec: number;
  lockDelaySec: number;
}

const SEED_MARKETS: MarketSeed[] = [
  { marketId: 1001, outcomeCount: 3, startDelaySec: 600, lockDelaySec: 3600 },
  { marketId: 1002, outcomeCount: 3, startDelaySec: 1200, lockDelaySec: 5400 },
  { marketId: 1003, outcomeCount: 2, startDelaySec: 600, lockDelaySec: 4000 }
];

async function main() {
  const contractAddress = process.env.VITE_CONTRACT_ADDRESS;
  if (!contractAddress) {
    throw new Error("Missing VITE_CONTRACT_ADDRESS environment variable");
  }

  const [operator] = await ethers.getSigners();
  console.log(`Seeding markets from ${operator.address} into ${contractAddress}`);

  const contract = (await ethers.getContractAt(
    "SportOracleBook",
    contractAddress
  )) as unknown as SportOracleBook;

  const now = Math.floor(Date.now() / 1000);

  for (const seed of SEED_MARKETS) {
    const startTime = now + seed.startDelaySec;
    const lockTime = now + seed.lockDelaySec;
    const tx = await contract
      .connect(operator)
      .createMarket(seed.marketId, seed.outcomeCount, startTime, lockTime);
    await tx.wait();
    console.log(`- Market ${seed.marketId} seeded (${seed.outcomeCount} outcomes)`);
  }

  console.log("✅ All seed markets have been created.");
}

main().catch((error) => {
  console.error("Seeding failed:", error);
  process.exitCode = 1;
});
