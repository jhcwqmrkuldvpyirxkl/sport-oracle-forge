import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  const address = await deployer.getAddress();
  const balance = await ethers.provider.getBalance(address);

  console.log("\n=== Sepolia Account Information ===");
  console.log("Address:", address);
  console.log("Balance:", ethers.formatEther(balance), "ETH");
  console.log("Balance (Wei):", balance.toString());

  if (balance === 0n) {
    console.log("\n❌ Balance is 0! Get test tokens from:");
    console.log("   - https://sepoliafaucet.com/");
    console.log("   - https://www.alchemy.com/faucets/ethereum-sepolia");
    console.log("   - https://www.infura.io/faucet/sepolia");
    return false;
  } else if (balance < ethers.parseEther("0.1")) {
    console.log("\n⚠️  Low balance (< 0.1 ETH)");
    console.log("   Recommended: at least 0.1 ETH for deployment and testing");
    console.log("   But you can try to continue deployment");
    return true;
  } else {
    console.log("\n✅ Sufficient balance, ready to deploy!");
    return true;
  }
}

main()
  .then((canDeploy) => {
    process.exit(canDeploy ? 0 : 1);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
