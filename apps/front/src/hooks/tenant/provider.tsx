import { createElement, useEffect, useState } from "react";
import { tenantManager } from "@/lib/tenant";
import { TenantContextInstance } from "./context";
import type { TenantContext, TenantProviderProps } from "./types";

export function TenantProvider({ children }: TenantProviderProps) {
	const [tenantState, setTenantState] = useState<TenantContext>({
		school: null,
		schoolId: null,
		slug: null,
		isTenantMode: false,
		isAdminMode: false,
		isLandingMode: false,
		isLoading: true,
	});

	useEffect(() => {
		const initializeTenant = async () => {
			try {
				const tenantInfo = await tenantManager.initialize();

				// Les modes sont déterminés par l'API (priorité) ou par détection locale (fallback)
				const isAdminMode = tenantInfo.isAdminMode;
				const isTenantMode = tenantInfo.isTenantMode;
				const isLandingMode = !isAdminMode && !isTenantMode;

				setTenantState({
					school: tenantInfo.tenant
						? {
								id: tenantInfo.tenant.schoolId,
								name: tenantInfo.tenant.name,
								slug: tenantInfo.tenant.slug,
							}
						: null,
					schoolId: tenantInfo.tenant?.schoolId || null,
					slug: tenantInfo.tenant?.slug || tenantManager.extractSubdomain(),
					isTenantMode,
					isAdminMode,
					isLandingMode,
					isLoading: false,
				});
			} catch (error) {
				console.error("Failed to initialize tenant:", error);

				// Fallback en cas d'erreur : détection locale
				const extractedSubdomain = tenantManager.extractSubdomain();
				const isAdminMode = extractedSubdomain === "admin";
				const isLandingMode = !extractedSubdomain;

				setTenantState({
					school: null,
					schoolId: null,
					slug: extractedSubdomain,
					isTenantMode: !!extractedSubdomain && !isAdminMode,
					isAdminMode,
					isLandingMode,
					isLoading: false,
				});
			}
		};

		initializeTenant();
	}, []);

	const value: TenantContext = {
		...tenantState,
	};

	return createElement(TenantContextInstance.Provider, { value }, children);
}
