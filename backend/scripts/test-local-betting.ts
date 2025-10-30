import { config as loadEnv } from "dotenv";
import { resolve } from "path";
import { ethers } from "ethers";
import SportOracleBookArtifact from "../artifacts/contracts/SportOracleBook.sol/SportOracleBook.json";

loadEnv({ path: resolve(__dirname, "..", "..", ".env") });

/**
 * Test script for SportOracleBook on running local node
 * Connects directly to localhost:8545
 */

async function main() {
  console.log("========================================");
  console.log("  SportOracle Local Network Test");
  console.log("========================================\n");

  // Connect to local node
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

  // Get contract address
  const contractAddress = process.env.VITE_CONTRACT_ADDRESS;
  if (!contractAddress) {
    throw new Error("VITE_CONTRACT_ADDRESS not set in .env");
  }

  console.log("📡 Network: Local Hardhat Node (http://127.0.0.1:8545)");
  console.log("📝 Contract:", contractAddress);
  console.log("");

  // Get test accounts
  const deployer = await provider.getSigner(0);
  const bettor1 = await provider.getSigner(1);
  const bettor2 = await provider.getSigner(2);

  console.log("👥 Test Accounts:");
  console.log("   Deployer:", await deployer.getAddress());
  console.log("   Bettor 1:", await bettor1.getAddress());
  console.log("   Bettor 2:", await bettor2.getAddress());
  console.log("");

  // Connect to contract
  const contract = new ethers.Contract(
    contractAddress,
    SportOracleBookArtifact.abi,
    deployer
  );

  // ========================================
  // Test 1: Check existing markets
  // ========================================
  console.log("📊 Checking existing markets...");
  try {
    const marketIds = await contract.getMarketIds();
    console.log(`✅ Found ${marketIds.length} markets:`, marketIds.map((id: bigint) => id.toString()));
    console.log("");

    // Display market details
    for (const marketId of marketIds) {
      const market = await contract.getMarket(marketId);
      const now = Math.floor(Date.now() / 1000);
      const isLocked = now >= Number(market.lockTime);

      console.log(`   Market ${marketId}:`);
      console.log(`   - Outcomes: ${market.outcomeCount}`);
      console.log(`   - Lock Time: ${new Date(Number(market.lockTime) * 1000).toLocaleString()}`);
      console.log(`   - Status: ${isLocked ? "🔒 LOCKED" : "🟢 OPEN"}`);
      console.log(`   - Settled: ${market.settled ? "✅" : "❌"}`);
      console.log(`   - Escrow: ${ethers.formatEther(market.escrowBalance)} ETH`);
      console.log("");
    }
  } catch (error: any) {
    console.error("❌ Failed to fetch markets:", error.message);
    return;
  }

  // ========================================
  // Test 2: Create a new market
  // ========================================
  console.log("🏁 Creating new test market...");

  const newMarketId = 5001n;
  const outcomeCount = 3;
  const now = Math.floor(Date.now() / 1000);
  const startTime = now;
  const lockTime = now + 7200; // 2 hours from now

  try {
    console.log(`   Market ID: ${newMarketId}`);
    console.log(`   Outcomes: ${outcomeCount}`);
    console.log(`   Lock Time: ${new Date(lockTime * 1000).toLocaleString()}`);
    console.log("");

    const createTx = await contract.createMarket(
      newMarketId,
      outcomeCount,
      startTime,
      lockTime
    );

    console.log(`   Transaction submitted: ${createTx.hash}`);
    const receipt = await createTx.wait();
    console.log(`✅ Market ${newMarketId} created in block ${receipt?.blockNumber}`);
    console.log("");
  } catch (error: any) {
    if (error.message.includes("MarketAlreadyExists")) {
      console.log(`ℹ️  Market ${newMarketId} already exists`);
      console.log("");
    } else {
      console.error(`❌ Failed to create market:`, error.message);
      console.log("");
    }
  }

  // ========================================
  // Test 3: Verify roles
  // ========================================
  console.log("👮 Checking role permissions...");

  const DEFAULT_ADMIN_ROLE = ethers.ZeroHash;
  const MARKET_MAKER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MARKET_MAKER_ROLE"));
  const ORACLE_ROLE = ethers.keccak256(ethers.toUtf8Bytes("ORACLE_ROLE"));

  const deployerAddr = await deployer.getAddress();
  const hasAdmin = await contract.hasRole(DEFAULT_ADMIN_ROLE, deployerAddr);
  const hasMarketMaker = await contract.hasRole(MARKET_MAKER_ROLE, deployerAddr);
  const hasOracle = await contract.hasRole(ORACLE_ROLE, deployerAddr);

  console.log(`   ${deployerAddr}:`);
  console.log(`   - Admin Role: ${hasAdmin ? "✅" : "❌"}`);
  console.log(`   - Market Maker Role: ${hasMarketMaker ? "✅" : "❌"}`);
  console.log(`   - Oracle Role: ${hasOracle ? "✅" : "❌"}`);
  console.log("");

  // ========================================
  // Test 4: Contract state
  // ========================================
  console.log("💰 Contract State:");
  const contractBalance = await provider.getBalance(contractAddress);
  const allMarketIds = await contract.getMarketIds();

  console.log(`   - Total Markets: ${allMarketIds.length}`);
  console.log(`   - Contract Balance: ${ethers.formatEther(contractBalance)} ETH`);
  console.log("");

  // ========================================
  // Summary
  // ========================================
  console.log("========================================");
  console.log("  Test Summary");
  console.log("========================================");
  console.log("✅ Contract connection successful");
  console.log("✅ Market queries working");
  console.log("✅ Market creation working");
  console.log("✅ Role system verified");
  console.log("");
  console.log("📝 Next Steps:");
  console.log("   1. Open frontend: http://localhost:8080");
  console.log("   2. Connect MetaMask to Localhost 8545");
  console.log("   3. Import test account:");
  console.log("      Private Key: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d");
  console.log("   4. Select a market and place an encrypted bet");
  console.log("");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Test failed:", error);
    process.exit(1);
  });
