import sportOracleAbiJson from "@/abi/SportOracleBook.json";

export const sportOracleAddress = (import.meta.env.VITE_CONTRACT_ADDRESS ||
  "0x0000000000000000000000000000000000000000") as `0x${string}`;

export const sportOracleAbi = sportOracleAbiJson as const;

export const SCALE = 1_000_000n;
