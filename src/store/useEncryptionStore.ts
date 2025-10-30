import { create } from "zustand";

type StageStatus = "idle" | "loading" | "ready" | "error";
type GatewayStatus = "unknown" | "online" | "error";

interface EncryptionState {
	wasmStatus: StageStatus;
	instanceStatus: StageStatus;
	gatewayStatus: GatewayStatus;
	message?: string;
	lastUpdated: number;
	setWasmStatus: (status: StageStatus, message?: string) => void;
	setInstanceStatus: (status: StageStatus, message?: string) => void;
	setGatewayStatus: (status: GatewayStatus, message?: string) => void;
	reset: () => void;
}

export const useEncryptionStore = create<EncryptionState>((set) => ({
	wasmStatus: "idle",
	instanceStatus: "idle",
	gatewayStatus: "unknown",
	message: undefined,
	lastUpdated: Date.now(),
	setWasmStatus: (status, message) =>
		set(() => ({
			wasmStatus: status,
			message,
			lastUpdated: Date.now()
		})),
	setInstanceStatus: (status, message) =>
		set(() => ({
			instanceStatus: status,
			message,
			lastUpdated: Date.now()
		})),
	setGatewayStatus: (status, message) =>
		set(() => ({
			gatewayStatus: status,
			message,
			lastUpdated: Date.now()
		})),
	reset: () =>
		set(() => ({
			wasmStatus: "idle",
			instanceStatus: "idle",
			gatewayStatus: "unknown",
			message: undefined,
			lastUpdated: Date.now()
		}))
}));
