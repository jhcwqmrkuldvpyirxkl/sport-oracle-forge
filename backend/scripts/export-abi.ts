import { writeFileSync } from "fs";
import { resolve } from "path";
import sportOracleArtifact from "../artifacts/contracts/SportOracleBook.sol/SportOracleBook.json";

/**
 * Exports the SportOracleBook ABI to the frontend src/abi directory
 * Usage: npm run export-abi (from backend directory)
 */
async function main() {
  const outputPath = resolve(__dirname, "../../src/abi/SportOracleBook.json");

  const abi = sportOracleArtifact.abi;

  console.log("Exporting SportOracleBook ABI...");
  console.log(`- Output path: ${outputPath}`);
  console.log(`- ABI contains ${abi.length} functions/events`);

  writeFileSync(outputPath, JSON.stringify(abi, null, 2), "utf-8");

  console.log("✅ ABI successfully exported to frontend!");
}

main().catch((error) => {
  console.error("Export failed:", error);
  process.exitCode = 1;
});
