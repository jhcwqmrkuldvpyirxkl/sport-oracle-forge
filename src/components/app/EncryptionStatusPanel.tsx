import { ShieldCheck, Loader2, AlertTriangle } from "lucide-react";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useEncryptionStore } from "@/store/useEncryptionStore";

export type EncryptionStatusPanelProps = {
	onRetry: () => void;
	isRetrying: boolean;
};

const STATUS_COPY: Record<string, string> = {
	idle: "Encryption runtime not initialised. It will start automatically before your first encrypted bet.",
	loading: "Preparing the Fully Homomorphic Encryption runtime. This may take a few seconds on first launch.",
	ready: "Encryption runtime is live. Your predictions and stakes remain private until settlement.",
	error: "Encryption runtime failed to start. Retry the initialisation before placing a bet."
};

export const EncryptionStatusPanel = ({ onRetry, isRetrying }: EncryptionStatusPanelProps) => {
	const { wasmStatus, instanceStatus, gatewayStatus, message } = useEncryptionStore();

	const variant = useMemo(() => {
		if (instanceStatus === "error" || wasmStatus === "error") {
			return "error";
		}
		if (instanceStatus === "ready" && gatewayStatus === "online") {
			return "ready";
		}
		return "loading";
	}, [gatewayStatus, instanceStatus, wasmStatus]);

	const headline = useMemo(() => {
		switch (variant) {
			case "ready":
				return "FHE Runtime Ready";
			case "error":
				return "FHE Runtime Unavailable";
			default:
				return "Initialising FHE Runtime";
		}
	}, [variant]);

	const description = useMemo(() => {
		const baseCopy = STATUS_COPY[instanceStatus] ?? STATUS_COPY.idle;
		return message ? `${baseCopy} (${message})` : baseCopy;
	}, [instanceStatus, message]);

	const icon = useMemo(() => {
		switch (variant) {
			case "ready":
				return <ShieldCheck className="h-5 w-5 text-emerald-400" />;
			case "error":
				return <AlertTriangle className="h-5 w-5 text-red-400" />;
			default:
				return <Loader2 className="h-5 w-5 text-primary animate-spin" />;
		}
	}, [variant]);

	return (
		<div
			className={`rounded-xl border p-4 sm:p-5 transition-colors ${
				variant === "ready"
					? "border-emerald-500/30 bg-emerald-500/10"
					: variant === "error"
						? "border-red-500/30 bg-red-500/5"
						: "border-primary/20 bg-primary/5"
			}`}
		>
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
				<div className="flex items-center gap-3">
					<div className="flex h-10 w-10 items-center justify-center rounded-full bg-background/70 shadow-inner">
						{icon}
					</div>
					<div>
						<p className="text-sm font-semibold text-foreground">{headline}</p>
						<p className="text-xs text-muted-foreground">{description}</p>
						<p className="text-xs text-muted-foreground mt-1">
							Gateway status: <span className="uppercase">{gatewayStatus}</span> • WASM:{" "}
							<span className="uppercase">{wasmStatus}</span>
						</p>
					</div>
				</div>
				{variant === "error" && (
					<Button
						variant="outline"
						size="sm"
						className="w-full sm:w-auto border-red-500/40 text-red-400 hover:bg-red-500/10"
						onClick={onRetry}
						disabled={isRetrying}
					>
						{isRetrying ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Retrying...
							</>
						) : (
							"Retry Initialisation"
						)}
					</Button>
				)}
			</div>
		</div>
	);
};
