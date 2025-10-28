import { config as loadEnv } from "dotenv";
import { resolve } from "path";
import { ethers } from "hardhat";
import { writeFileSync } from "fs";

loadEnv({ path: resolve(__dirname, "..", "..", ".env") });

/**
 * Deployment script for SportOracleBook contract
 * - Deploys contract to specified network
 * - Saves contract address to .env file
 * - Exports ABI to frontend
 */
async function main() {
  const [deployer] = await ethers.getSigners();

  const adminAddress = process.env.ADDRESS ?? deployer.address;
  const gatewayAddress = process.env.GATEWAY_ADDRESS ?? adminAddress;

  console.log("========================================");
  console.log("  SportOracleBook Deployment");
  console.log("========================================");
  console.log(`Network: ${(await ethers.provider.getNetwork()).name}`);
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Admin: ${adminAddress}`);
  console.log(`Gateway: ${gatewayAddress}`);
  console.log("");

  // Deploy contract
  console.log("Deploying SportOracleBook contract...");
  const sportOracleFactory = await ethers.getContractFactory("SportOracleBook");
  const sportOracleContract = await sportOracleFactory.deploy(adminAddress, gatewayAddress);
  await sportOracleContract.waitForDeployment();

  const contractAddress = await sportOracleContract.getAddress();
  console.log(`✅ SportOracleBook deployed at: ${contractAddress}`);

  // Update .env file with contract address
  const envPath = resolve(__dirname, "..", "..", ".env");
  let envContent = "";
  try {
    envContent = require("fs").readFileSync(envPath, "utf-8");
  } catch (error) {
    console.warn("Could not read .env file");
  }

  const lines = envContent.split("\n");
  let updated = false;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith("VITE_CONTRACT_ADDRESS=")) {
      lines[i] = `VITE_CONTRACT_ADDRESS=${contractAddress}`;
      updated = true;
      break;
    }
  }

  if (updated) {
    writeFileSync(envPath, lines.join("\n"), "utf-8");
    console.log(`✅ Updated VITE_CONTRACT_ADDRESS in .env file`);
  } else {
    console.log(`⚠️ VITE_CONTRACT_ADDRESS not found in .env file`);
  }

  console.log("");
  console.log("========================================");
  console.log("  Next Steps:");
  console.log("========================================");
  console.log("1. Run: npm run export-abi");
  console.log("2. Run: npm run verify (for Etherscan verification)");
  console.log("3. Run: npm run seed (to create demo markets)");
  console.log("4. Test frontend: cd .. && npm run dev");
  console.log("");
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});
