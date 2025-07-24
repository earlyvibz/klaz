import { createContext, useContext } from "react";
import type { TenantContext } from "./types";

const TenantContextInstance = createContext<TenantContext | null>(null);

export { TenantContextInstance };

export function useTenant() {
	const context = useContext(TenantContextInstance);
	if (!context) {
		throw new Error("useTenant must be used within a TenantProvider");
	}
	return context;
}
