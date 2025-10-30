import { config as loadEnv } from "dotenv";
import { resolve } from "path";
import { ethers } from "ethers";
import SportOracleBookArtifact from "../artifacts/contracts/SportOracleBook.sol/SportOracleBook.json";

loadEnv({ path: resolve(__dirname, "..", "..", ".env") });

async function main() {
  console.log("🌱 Seeding markets on local network...\n");

  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
  const deployer = await provider.getSigner(0);

  const contractAddress = process.env.VITE_CONTRACT_ADDRESS;
  if (!contractAddress) {
    throw new Error("VITE_CONTRACT_ADDRESS not set");
  }

  const contract = new ethers.Contract(
    contractAddress,
    SportOracleBookArtifact.abi,
    deployer
  );

  console.log(`Deployer: ${await deployer.getAddress()}`);
  console.log(`Contract: ${contractAddress}\n`);

  const now = Math.floor(Date.now() / 1000);
  const markets = [
    {
      id: 1001n,
      outcomeCount: 3,
      name: "Premier League: Arsenal vs Chelsea",
      startTime: now,
      lockTime: now + 86400, // 1 day
    },
    {
      id: 1002n,
      outcomeCount: 3,
      name: "La Liga: Real Madrid vs Barcelona",
      startTime: now,
      lockTime: now + 86400 * 2, // 2 days
    },
    {
      id: 1003n,
      outcomeCount: 2,
      name: "NBA: Lakers vs Warriors",
      startTime: now,
      lockTime: now + 86400 * 3, // 3 days
    },
  ];

  for (const market of markets) {
    try {
      console.log(`Creating Market ${market.id}: ${market.name}`);
      console.log(`  - Outcomes: ${market.outcomeCount}`);
      console.log(`  - Lock Time: ${new Date(market.lockTime * 1000).toLocaleString()}`);

      const tx = await contract.createMarket(
        market.id,
        market.outcomeCount,
        market.startTime,
        market.lockTime
      );

      await tx.wait();
      console.log(`  ✅ Created in tx: ${tx.hash}\n`);
    } catch (error: any) {
      if (error.message.includes("MarketAlreadyExists")) {
        console.log(`  ℹ️  Market already exists\n`);
      } else {
        console.error(`  ❌ Failed:`, error.message, "\n");
      }
    }
  }

  // Verify markets
  console.log("📊 Verifying created markets...\n");
  const marketIds = await contract.getMarketIds();
  console.log(`Total markets: ${marketIds.length}`);

  for (const marketId of marketIds) {
    const market = await contract.getMarket(marketId);
    console.log(`\nMarket ${marketId}:`);
    console.log(`  - Outcomes: ${market.outcomeCount}`);
    console.log(`  - Lock Time: ${new Date(Number(market.lockTime) * 1000).toLocaleString()}`);
    console.log(`  - Settled: ${market.settled}`);
  }

  console.log("\n✅ All markets seeded successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exit(1);
  });
