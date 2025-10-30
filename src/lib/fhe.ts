import { encodeAbiParameters, keccak256, toHex } from "viem";
import { useEncryptionStore } from "@/store/useEncryptionStore";

type RelayerModule = typeof import("@zama-fhe/relayer-sdk/bundle");
type FheInstance = Awaited<ReturnType<RelayerModule["createInstance"]>>;

type EncryptedInputHandles = {
	handles: `0x${string}`[];
	inputProof: Uint8Array;
};

type FheEncryptedInput = {
	add32: (value: number) => void;
	add64: (value: bigint) => void;
	encrypt: () => Promise<EncryptedInputHandles>;
};

const RELAYER_BUNDLE_ENTRY = new URL(
	"../../node_modules/@zama-fhe/relayer-sdk/bundle/relayer-sdk-js.js",
	import.meta.url
).href;

const store = () => useEncryptionStore.getState();

let relayerModulePromise: Promise<RelayerModule> | null = null;
let fheInstance: FheInstance | null = null;
let initPromise: Promise<FheInstance> | null = null;

async function loadRelayerModule(): Promise<RelayerModule> {
	if (!relayerModulePromise) {
		relayerModulePromise = import(
			/* @vite-ignore */
			RELAYER_BUNDLE_ENTRY
		) as Promise<RelayerModule>;
	}
	return relayerModulePromise;
}

async function initFheInstance() {
	if (fheInstance) {
		return fheInstance;
	}

	if (initPromise) {
		return initPromise;
	}

	store().setWasmStatus("loading", "Initializing FHE WebAssembly runtime…");

	try {
		console.log("[FHE] Initializing SDK...");
		initPromise = (async () => {
			const sdk = await loadRelayerModule();
			await sdk.initSDK();
			store().setWasmStatus("ready", "WASM runtime ready");
			store().setInstanceStatus("loading", "Requesting Sepolia public parameters…");

			console.log("[FHE] Creating FHE instance with Sepolia config");
			const instance = await sdk.createInstance(sdk.SepoliaConfig);
			console.log("[FHE] Instance created successfully");
			fheInstance = instance;
			store().setInstanceStatus("ready", "FHE instance ready");
			store().setGatewayStatus("online", "Gateway reachable");
			return instance;
		})();

		return await initPromise;
	} catch (error) {
		console.error("[FHE] SDK initialization failed:", error);
		store().setWasmStatus("error", "Failed to initialise the FHE SDK");
		store().setInstanceStatus("error", "FHE instance unavailable");
		store().setGatewayStatus("error", "Gateway unreachable");
		initPromise = null;
		throw error;
	} finally {
		initPromise = null;
	}
}

export async function ensureFheInstance(): Promise<FheInstance> {
	if (fheInstance) {
		return fheInstance;
	}

	return initFheInstance();
}

export function getFheInstance() {
	return fheInstance;
}

export async function encryptBetPayload(
	contractAddress: `0x${string}`,
	bettor: `0x${string}`,
	outcomeId: number,
	stakeWei: bigint
) {
	const instance = await ensureFheInstance();
	const input: FheEncryptedInput = instance.createEncryptedInput(contractAddress, bettor);
	input.add32(outcomeId);
	input.add64(stakeWei);
	const { handles, inputProof } = await input.encrypt();

	console.log("[FHE] Raw encrypted data:", {
		handlesType: Array.isArray(handles) ? "array" : typeof handles,
		handlesLength: Array.isArray(handles) ? handles.length : "N/A",
		handle0Type: typeof handles[0],
		handle0Value: handles[0],
		handle1Type: typeof handles[1],
		handle1Value: handles[1],
		inputProofType: typeof inputProof,
		inputProofLength: inputProof instanceof Uint8Array ? inputProof.length : "N/A"
	});

	const ensureHexString = (value: unknown): `0x${string}` => {
		if (typeof value === "string") {
			return value.startsWith("0x") ? (value as `0x${string}`) : (`0x${value}` as `0x${string}`);
		}

		if (value instanceof Uint8Array) {
			return toHex(value);
		}

		if (typeof value === "bigint") {
			return `0x${value.toString(16).padStart(64, "0")}` as `0x${string}`;
		}

		console.warn("[FHE] Unexpected handle type:", value);
		return toHex(value as Parameters<typeof toHex>[0]);
	};

	const result = {
		encryptedOutcome: ensureHexString(handles[0]),
		encryptedStake: ensureHexString(handles[1]),
		proof: inputProof
	};

	console.log("[FHE] Converted encrypted data:", {
		encryptedOutcome: result.encryptedOutcome,
		encryptedStake: result.encryptedStake,
		proofType: typeof result.proof,
		proofLength:
			result.proof instanceof Uint8Array
				? result.proof.length
				: typeof result.proof === "string"
					? result.proof.length
					: "N/A"
	});

	return result;
}

export function buildCommitment(
	encryptedOutcome: `0x${string}`,
	encryptedStake: `0x${string}`,
	bettor: `0x${string}`
) {
	return keccak256(
		encodeAbiParameters(
			[
				{ type: "bytes32" },
				{ type: "bytes32" },
				{ type: "address" }
			],
			[encryptedOutcome, encryptedStake, bettor]
		)
	);
}
