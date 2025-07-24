export interface School {
	id: string;
	name: string;
	slug: string;
}

export interface TenantContext {
	school: School | null;
	schoolId: string | null;
	slug: string | null;
	isTenantMode: boolean;
	isAdminMode: boolean;
	isLandingMode: boolean;
	isLoading: boolean;
}

export interface TenantProviderProps {
	children: React.ReactNode;
}

export interface TenantApiResponse {
	isTenantMode: boolean;
	isAdminMode: boolean;
	tenant: {
		schoolId: string;
		slug: string;
		name: string;
	} | null;
}
