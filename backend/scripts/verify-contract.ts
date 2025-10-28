import { config as loadEnv } from "dotenv";
import { resolve } from "path";
import { run } from "hardhat";

loadEnv({ path: resolve(__dirname, "..", "..", ".env") });

/**
 * Verifies the SportOracleBook contract on Etherscan
 * Usage: npx hardhat run scripts/verify-contract.ts --network sepolia
 */
async function main() {
  const contractAddress = process.env.VITE_CONTRACT_ADDRESS;

  if (!contractAddress || contractAddress === "0x0000000000000000000000000000000000000000") {
    throw new Error("VITE_CONTRACT_ADDRESS not set in .env file");
  }

  const adminAddress = process.env.ADDRESS;
  const gatewayAddress = process.env.GATEWAY_ADDRESS || adminAddress;

  console.log("Verifying SportOracleBook contract...");
  console.log(`- Contract Address: ${contractAddress}`);
  console.log(`- Admin Address: ${adminAddress}`);
  console.log(`- Gateway Address: ${gatewayAddress}`);

  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: [adminAddress, gatewayAddress],
    });

    console.log("✅ Contract successfully verified on Etherscan!");
  } catch (error) {
    if (error instanceof Error && error.message.includes("Already Verified")) {
      console.log("Contract is already verified!");
    } else {
      console.error("Verification failed:", error);
      throw error;
    }
  }
}

main().catch((error) => {
  console.error("Script failed:", error);
  process.exitCode = 1;
});
