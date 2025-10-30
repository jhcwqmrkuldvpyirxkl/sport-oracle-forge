import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  console.log("\n🚀 Deploying SportOracleBook to Sepolia testnet...\n");

  const [deployer] = await ethers.getSigners();
  const deployerAddress = await deployer.getAddress();
  const balance = await ethers.provider.getBalance(deployerAddress);

  console.log("Deployer account:", deployerAddress);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");

  if (balance < ethers.parseEther("0.05")) {
    console.error("\n❌ Insufficient balance! At least 0.05 ETH required for deployment");
    console.error("Get test tokens from https://sepoliafaucet.com/");
    process.exit(1);
  }

  console.log("\n📝 Deployment parameters:");
  console.log("   Admin: ", deployerAddress);
  console.log("   Gateway: 0x0000000000000000000000000000000000000000 (Zama Gateway)");

  console.log("\n⏳ Compiling contracts...");
  const SportOracleBook = await ethers.getContractFactory("SportOracleBook");

  console.log("⏳ Deploying contract...");
  const contract = await SportOracleBook.deploy(
    deployerAddress, // admin (has all roles)
    ethers.ZeroAddress // gateway (Zama will configure automatically)
  );

  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();

  console.log("\n✅ Deployment successful!");
  console.log("Contract address:", contractAddress);
  console.log("Etherscan:", `https://sepolia.etherscan.io/address/${contractAddress}`);

  // Wait for block confirmations
  console.log("\n⏳ Waiting for block confirmations...");
  const receipt = await contract.deploymentTransaction()?.wait(3);
  console.log("Transaction hash:", receipt?.hash);
  console.log("Block number:", receipt?.blockNumber);
  console.log("Gas used:", receipt?.gasUsed.toString());

  // Verify role configuration
  console.log("\n🔍 Verifying role configuration...");
  const DEFAULT_ADMIN_ROLE = ethers.ZeroHash;
  const MARKET_MAKER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MARKET_MAKER_ROLE"));
  const ORACLE_ROLE = ethers.keccak256(ethers.toUtf8Bytes("ORACLE_ROLE"));

  const hasAdmin = await contract.hasRole(DEFAULT_ADMIN_ROLE, deployerAddress);
  const hasMarketMaker = await contract.hasRole(MARKET_MAKER_ROLE, deployerAddress);
  const hasOracle = await contract.hasRole(ORACLE_ROLE, deployerAddress);

  console.log("   DEFAULT_ADMIN_ROLE:", hasAdmin ? "✅" : "❌");
  console.log("   MARKET_MAKER_ROLE:", hasMarketMaker ? "✅" : "❌");
  console.log("   ORACLE_ROLE:", hasOracle ? "✅" : "❌");

  // Update .env file
  console.log("\n📝 Updating environment variables...");
  const envPath = path.resolve(__dirname, "..", "..", ".env");
  let envContent = fs.readFileSync(envPath, "utf8");

  // Update or add VITE_CONTRACT_ADDRESS
  if (envContent.includes("VITE_CONTRACT_ADDRESS=")) {
    envContent = envContent.replace(
      /VITE_CONTRACT_ADDRESS=.*/,
      `VITE_CONTRACT_ADDRESS=${contractAddress}`
    );
  } else {
    envContent += `\nVITE_CONTRACT_ADDRESS=${contractAddress}`;
  }

  fs.writeFileSync(envPath, envContent);
  console.log("   .env file updated");

  // Export deployment information
  const deploymentInfo = {
    network: "sepolia",
    chainId: 11155111,
    contractAddress,
    deployer: deployerAddress,
    deploymentTime: new Date().toISOString(),
    transactionHash: receipt?.hash,
    blockNumber: receipt?.blockNumber,
    gasUsed: receipt?.gasUsed.toString(),
    etherscan: `https://sepolia.etherscan.io/address/${contractAddress}`
  };

  const deploymentPath = path.resolve(__dirname, "..", "deployments", "sepolia.json");
  fs.mkdirSync(path.dirname(deploymentPath), { recursive: true });
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log("   Deployment info saved to:", deploymentPath);

  console.log("\n✅ Deployment complete!");
  console.log("\n📋 Next steps:");
  console.log("   1. Run: npx hardhat run scripts/seed-sepolia-markets.ts --network sepolia");
  console.log("   2. Start frontend: npm run dev");
  console.log("   3. Switch MetaMask to Sepolia network");
  console.log("   4. Start testing encrypted betting!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:", error);
    process.exit(1);
  });
