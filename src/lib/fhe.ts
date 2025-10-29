import { AbiCoder, keccak256, hexlify } from "ethers";

// Based on Zama reference implementation
// Using Relayer SDK from CDN to bypass bundling issues

type EncryptedInputHandles = {
  handles: `0x${string}`[];
  inputProof: Uint8Array;
};

type FheEncryptedInput = {
  add32: (value: number) => void;
  add64: (value: bigint) => void;
  encrypt: () => Promise<EncryptedInputHandles>;
};

type FheInstance = {
  createEncryptedInput: (contract: `0x${string}`, bettor: `0x${string}`) => FheEncryptedInput;
};

let fheInstance: FheInstance | null = null;
let isMockMode = false;

const toHandle = (value: bigint) => `0x${value.toString(16).padStart(64, "0")}` as `0x${string}`;

const createMockInstance = (): FheInstance => ({
  createEncryptedInput: () => {
    const handles: `0x${string}`[] = ["0x0", "0x0"];
    let outcome: `0x${string}` = handles[0];
    let stake: `0x${string}` = handles[1];

    return {
      add32: (value: number) => {
        outcome = toHandle(BigInt(value));
        handles[0] = outcome;
      },
      add64: (value: bigint) => {
        stake = toHandle(value);
        handles[1] = stake;
      },
      async encrypt() {
        return {
          handles: [outcome, stake],
          inputProof: new Uint8Array()
        };
      }
    };
  }
});

async function loadSdkFromCdn() {
  try {
    console.log("[FHE] Loading Relayer SDK from CDN...");
    // Load SDK from Zama CDN
    const sdk: any = await import("https://cdn.zama.ai/relayer-sdk-js/0.2.0/relayer-sdk-js.js");
    const { initSDK, createInstance, SepoliaConfig } = sdk;

    console.log("[FHE] Initializing WASM...");
    await initSDK();

    console.log("[FHE] Creating FHE instance with Sepolia config");
    const instance = await createInstance(SepoliaConfig);

    console.log("[FHE] Instance created successfully");
    return instance as FheInstance;
  } catch (err: any) {
    console.error("[FHE] SDK loading failed:", err);
    console.warn("[FHE] Falling back to mock encryption");
    isMockMode = true;
    return null;
  }
}

export async function ensureFheInstance(): Promise<FheInstance> {
  if (fheInstance) {
    return fheInstance;
  }

  const instance = await loadSdkFromCdn();
  if (!instance) {
    fheInstance = createMockInstance();
    return fheInstance;
  }

  fheInstance = instance;
  return fheInstance;
}

export async function encryptBetPayload(
  contractAddress: `0x${string}`,
  bettor: `0x${string}`,
  outcomeId: number,
  stakeWei: bigint
) {
  const instance = await ensureFheInstance();
  const input = instance.createEncryptedInput(contractAddress, bettor);
  input.add32(outcomeId);
  input.add64(stakeWei);
  const { handles, inputProof } = await input.encrypt();

  // Ensure handles are properly formatted as hex strings
  const ensureHexString = (value: any): `0x${string}` => {
    if (typeof value === "string") {
      return value.startsWith("0x") ? value as `0x${string}` : `0x${value}` as `0x${string}`;
    }
    // If it's a Uint8Array, convert to hex using ethers hexlify
    if (value instanceof Uint8Array) {
      return hexlify(value) as `0x${string}`;
    }
    // If it's a bigint, convert to hex
    if (typeof value === "bigint") {
      return `0x${value.toString(16).padStart(64, "0")}` as `0x${string}`;
    }
    // Fallback: try to convert to string
    console.warn(`[FHE] Unexpected handle type: ${typeof value}, value:`, value);
    return hexlify(value) as `0x${string}`;
  };

  return {
    encryptedOutcome: ensureHexString(handles[0]),
    encryptedStake: ensureHexString(handles[1]),
    proof: inputProof
  };
}

export function buildCommitment(
  encryptedOutcome: `0x${string}`,
  encryptedStake: `0x${string}`,
  bettor: `0x${string}`
) {
  return keccak256(
    AbiCoder.defaultAbiCoder().encode(["bytes32", "bytes32", "address"], [encryptedOutcome, encryptedStake, bettor])
  );
}

export function isMockEncryption() {
  return isMockMode;
}
