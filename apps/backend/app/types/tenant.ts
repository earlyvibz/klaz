import type School from "#models/school";

export interface TenantContext {
	school: School;
	schoolId: string;
	slug: string;
}

declare module "@adonisjs/core/http" {
	interface HttpContext {
		tenant: TenantContext | null;
		adminMode: boolean;
	}
}
