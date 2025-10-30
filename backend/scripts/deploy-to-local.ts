import { config as loadEnv } from "dotenv";
import { resolve } from "path";
import { ethers } from "ethers";
import SportOracleBookArtifact from "../artifacts/contracts/SportOracleBook.sol/SportOracleBook.json";
import * as fs from "fs";

loadEnv({ path: resolve(__dirname, "..", "..", ".env") });

async function main() {
  console.log("========================================");
  console.log("  SportOracleBook Deployment (Local)");
  console.log("========================================");

  // Connect to local node
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
  const deployer = await provider.getSigner(0);
  const deployerAddress = await deployer.getAddress();

  console.log("Network: Localhost (127.0.0.1:8545)");
  console.log("Deployer:", deployerAddress);
  console.log("");

  // Deploy contract
  console.log("Deploying SportOracleBook...");

  const factory = new ethers.ContractFactory(
    SportOracleBookArtifact.abi,
    SportOracleBookArtifact.bytecode,
    deployer
  );

  // Use deployer as both admin and gateway for local testing
  const adminAddress = deployerAddress;
  const gatewayAddress = deployerAddress;

  console.log("Admin:", adminAddress);
  console.log("Gateway:", gatewayAddress);
  console.log("");

  const contract = await factory.deploy(adminAddress, gatewayAddress);
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log("✅ SportOracleBook deployed at:", contractAddress);
  console.log("");

  // Update .env file
  const envPath = resolve(__dirname, "..", "..", ".env");
  let envContent = fs.readFileSync(envPath, "utf-8");

  const viteAddressRegex = /VITE_CONTRACT_ADDRESS=.*/;
  if (viteAddressRegex.test(envContent)) {
    envContent = envContent.replace(viteAddressRegex, `VITE_CONTRACT_ADDRESS=${contractAddress}`);
  } else {
    envContent += `\nVITE_CONTRACT_ADDRESS=${contractAddress}`;
  }

  fs.writeFileSync(envPath, envContent);
  console.log("✅ Updated VITE_CONTRACT_ADDRESS in .env file");
  console.log("");

  console.log("========================================");
  console.log("  Next Steps:");
  console.log("========================================");
  console.log("1. Run: npm run seed:local (create demo markets)");
  console.log("2. Frontend is already running at http://localhost:8080");
  console.log("3. Connect wallet and test betting");
  console.log("");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
