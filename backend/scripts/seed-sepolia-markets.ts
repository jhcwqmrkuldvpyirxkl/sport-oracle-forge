import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  console.log("\n🌱 Creating test markets on Sepolia...\n");

  // Read deployment information
  const deploymentPath = path.resolve(__dirname, "..", "deployments", "sepolia.json");
  if (!fs.existsSync(deploymentPath)) {
    console.error("❌ Deployment info not found. Please run deployment script first");
    process.exit(1);
  }

  const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
  const contractAddress = deployment.contractAddress;

  console.log("Contract address:", contractAddress);
  console.log("Etherscan:", deployment.etherscan);

  const [deployer] = await ethers.getSigners();
  const deployerAddress = await deployer.getAddress();
  console.log("Deployer account:", deployerAddress);

  // Connect to deployed contract
  const SportOracleBook = await ethers.getContractFactory("SportOracleBook");
  const contract = SportOracleBook.attach(contractAddress);

  // Check permissions
  const MARKET_MAKER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MARKET_MAKER_ROLE"));
  const hasRole = await contract.hasRole(MARKET_MAKER_ROLE, deployerAddress);

  if (!hasRole) {
    console.error("❌ Current account does not have MARKET_MAKER_ROLE");
    process.exit(1);
  }

  console.log("✅ MARKET_MAKER_ROLE verified\n");

  // Define test markets
  const now = Math.floor(Date.now() / 1000);
  const oneDay = 86400;

  const markets = [
    {
      id: 1001,
      name: "Premier League: Arsenal vs Chelsea",
      outcomeCount: 3,
      startTime: now,
      lockTime: now + oneDay, // Lock after 1 day
    },
    {
      id: 1002,
      name: "La Liga: Real Madrid vs Barcelona",
      outcomeCount: 3,
      startTime: now,
      lockTime: now + 2 * oneDay, // Lock after 2 days
    },
    {
      id: 1003,
      name: "NBA: Lakers vs Warriors",
      outcomeCount: 2,
      startTime: now,
      lockTime: now + 3 * oneDay, // Lock after 3 days
    },
  ];

  console.log("📋 Markets to create:\n");
  for (const market of markets) {
    const lockDate = new Date(market.lockTime * 1000);
    console.log(`Market ${market.id}: ${market.name}`);
    console.log(`   Outcomes: ${market.outcomeCount}`);
    console.log(`   Lock time: ${lockDate.toLocaleString()}`);
    console.log();
  }

  // Create markets
  console.log("⏳ Creating markets...\n");

  for (const market of markets) {
    try {
      console.log(`Creating Market ${market.id}: ${market.name}...`);

      const tx = await contract.createMarket(
        market.id,
        market.outcomeCount,
        market.startTime,
        market.lockTime
      );

      console.log(`   Transaction hash: ${tx.hash}`);
      console.log(`   Waiting for confirmation...`);

      const receipt = await tx.wait();
      console.log(`   ✅ Confirmed (block #${receipt?.blockNumber})`);
      console.log(`   Gas used: ${receipt?.gasUsed.toString()}`);
      console.log();
    } catch (error: any) {
      console.error(`   ❌ Failed:`, error.message);
      console.log();
    }
  }

  // Verify created markets
  console.log("🔍 Verifying market list...\n");

  const marketIds = await contract.getMarketIds();
  console.log(`Total markets: ${marketIds.length}`);
  console.log(`Market IDs: [${marketIds.map((id: bigint) => id.toString()).join(", ")}]`);

  console.log("\n📊 Market details:\n");
  for (const marketId of marketIds) {
    const market = await contract.getMarket(marketId);
    const lockDate = new Date(Number(market.lockTime) * 1000);

    console.log(`Market ${marketId}:`);
    console.log(`   Outcomes: ${market.outcomeCount}`);
    console.log(`   Lock time: ${lockDate.toLocaleString()}`);
    console.log(`   Settled: ${market.settled ? "Yes" : "No"}`);
    console.log(`   Escrow balance: ${ethers.formatEther(market.escrowBalance)} ETH`);
    console.log();
  }

  console.log("✅ Market creation complete!\n");
  console.log("📋 Next steps:");
  console.log("   1. Frontend contract address is auto-updated");
  console.log("   2. Switch MetaMask to Sepolia network");
  console.log("   3. Visit http://localhost:8080/dapp");
  console.log("   4. Start testing encrypted betting!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Market creation failed:", error);
    process.exit(1);
  });
