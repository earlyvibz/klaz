import type { ReactNode } from "react";
import { useTenantGuard } from "@/hooks/tenant";

interface TenantGuardProps {
	children: ReactNode;
	requireTenant?: boolean;
	requireGlobal?: boolean;
	fallback?: ReactNode;
}

export function TenantGuard({
	children,
	requireTenant = false,
	requireGlobal = false,
	fallback = null,
}: TenantGuardProps) {
	const {
		requireTenant: hasTenant,
		requireGlobalMode: hasGlobal,
		isLoading,
	} = useTenantGuard();

	if (isLoading) {
		return <div>Chargement...</div>;
	}

	if (requireTenant && !hasTenant()) {
		return fallback || <div>Accès tenant requis</div>;
	}

	if (requireGlobal && !hasGlobal()) {
		return fallback || <div>Accès global requis</div>;
	}

	return <>{children}</>;
}
