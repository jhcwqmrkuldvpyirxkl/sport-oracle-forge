import { useCallback, useState } from "react";
import { ensureFheInstance, getFheInstance } from "@/lib/fhe";
import { useEncryptionStore } from "@/store/useEncryptionStore";

export function useFHE() {
	const [instance, setInstance] = useState(getFheInstance());
	const [error, setError] = useState<string | null>(null);

	const resetStore = useEncryptionStore((state) => state.reset);
	const status = useEncryptionStore((state) => ({
		wasmStatus: state.wasmStatus,
		instanceStatus: state.instanceStatus,
		gatewayStatus: state.gatewayStatus,
		message: state.message,
		lastUpdated: state.lastUpdated
	}));

	const initialize = useCallback(async () => {
		try {
			const created = await ensureFheInstance();
			setInstance(created);
			setError(null);
			return created;
		} catch (err) {
			const reason = err instanceof Error ? err.message : "Failed to initialise the FHE SDK";
			setError(reason);
			throw err;
		}
	}, []);

	const reset = useCallback(() => {
		resetStore();
		setError(null);
	}, [resetStore]);

	return {
		instance,
		initialize,
		reset,
		error,
		status,
		isReady: status.instanceStatus === "ready"
	};
}
