import { AbiCoder, keccak256 } from "ethers";

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

type SdkModule = typeof import("@zama-fhe/relayer-sdk/bundle");

let sdkPromise: Promise<SdkModule | null> | null = null;
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

async function loadSdk(): Promise<SdkModule | null> {
  if (!sdkPromise) {
    sdkPromise = import("@zama-fhe/relayer-sdk/bundle")
      .then((module) => module)
      .catch((error) => {
        console.warn("FHE SDK unavailable. Falling back to mock encryption.", error);
        isMockMode = true;
        return null;
      });
  }
  return sdkPromise;
}

export async function ensureFheInstance(): Promise<FheInstance> {
  if (fheInstance) {
    return fheInstance;
  }

  const sdk = await loadSdk();
  if (!sdk) {
    fheInstance = createMockInstance();
    return fheInstance;
  }

  await sdk.initSDK();
  fheInstance = (await sdk.createInstance(sdk.SepoliaConfig)) as FheInstance;
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

  return {
    encryptedOutcome: handles[0],
    encryptedStake: handles[1],
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
