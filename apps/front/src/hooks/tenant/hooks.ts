import { useCallback } from "react";
import { tuyau } from "@/main";
import { useTenant } from "./context";

export function useTenantApi() {
	const { isTenantMode, schoolId } = useTenant();

	const scopedTuyau = useCallback(() => {
		// Retourner tuyau avec le contexte tenant automatiquement appliqué
		return tuyau;
	}, []);

	return {
		api: scopedTuyau(),
		isTenantMode,
		schoolId,
	};
}

export function useTenantNavigation() {
	const { isTenantMode, slug } = useTenant();

	const getTenantUrl = useCallback(
		(path: string) => {
			if (!isTenantMode || !slug) {
				return path;
			}

			// En développement, utiliser des paramètres URL
			if (window.location.hostname === "localhost") {
				const url = new URL(path, window.location.origin);
				url.searchParams.set("tenant", slug);
				return url.pathname + url.search;
			}

			// En production, utiliser le subdomain
			return path;
		},
		[isTenantMode, slug],
	);

	const navigateToTenant = useCallback(
		(path: string) => {
			const tenantUrl = getTenantUrl(path);
			window.location.href = tenantUrl;
		},
		[getTenantUrl],
	);

	return {
		getTenantUrl,
		navigateToTenant,
		isTenantMode,
		slug,
	};
}

export function useTenantGuard() {
	const { isTenantMode, isLoading } = useTenant();

	const requireTenant = useCallback(() => {
		if (isLoading) return false;
		return isTenantMode;
	}, [isTenantMode, isLoading]);

	const requireGlobalMode = useCallback(() => {
		if (isLoading) return false;
		return !isTenantMode;
	}, [isTenantMode, isLoading]);

	return {
		requireTenant,
		requireGlobalMode,
		isLoading,
	};
}
