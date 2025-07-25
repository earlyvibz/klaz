import type { TenantApiResponse } from "@/hooks/tenant/types";

export class TenantManager {
	private static instance: TenantManager;
	private tenantCache: TenantApiResponse | null = null;

	private constructor() {}

	static getInstance(): TenantManager {
		if (!TenantManager.instance) {
			TenantManager.instance = new TenantManager();
		}
		return TenantManager.instance;
	}

	/**
	 * Extrait le subdomain depuis l'URL actuelle
	 * Logique identique au backend pour consistance
	 */
	extractSubdomain(): string | null {
		const hostname = window.location.hostname;
		const parts = hostname.split(".");

		// Besoin d'au moins 2 parties (subdomain.domain.com)
		if (parts.length >= 2) {
			const subdomain = parts[0];
			// Extraire tous les subdomains sauf www et localhost
			if (subdomain && subdomain !== "www" && subdomain !== "localhost") {
				return subdomain;
			}
		}

		return null;
	}

	isAdminSubdomain(): boolean {
		return this.extractSubdomain() === "admin";
	}

	isLandingMode(): boolean {
		const subdomain = this.extractSubdomain();
		return !subdomain; // Pas de subdomain = landing page
	}

	async fetchTenantInfo(): Promise<TenantApiResponse> {
		try {
			const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3333";
			const response = await fetch(`${baseUrl}/tenant/info`, {
				headers: {
					Authorization: `Bearer ${localStorage.getItem("auth-token") || ""}`,
				},
			});

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}`);
			}

			const data = await response.json();
			return data as TenantApiResponse;
		} catch (error) {
			console.error("Failed to fetch tenant info:", error);
			return {
				isTenantMode: false,
				isAdminMode: false,
				tenant: null,
			};
		}
	}

	async initialize(): Promise<TenantApiResponse> {
		if (this.tenantCache) {
			return this.tenantCache;
		}

		const tenantInfo = await this.fetchTenantInfo();
		this.tenantCache = tenantInfo;
		return tenantInfo;
	}

	clearCache(): void {
		this.tenantCache = null;
	}

	getCurrentSubdomain(): string | null {
		return this.extractSubdomain();
	}
}

export const tenantManager = TenantManager.getInstance();
