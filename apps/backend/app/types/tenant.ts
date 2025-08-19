import type School from "#models/school";

export interface TenantContext {
	school: School | null;
	schoolId: string | null;
	slug: string | null;
}

declare module "@adonisjs/core/http" {
	interface HttpContext {
		school: School | null;
	}
}
