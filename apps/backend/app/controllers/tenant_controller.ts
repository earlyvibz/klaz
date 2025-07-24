import type { HttpContext } from "@adonisjs/core/http";
import type { TenantContext } from "#types/tenant";

export default class TenantController {
	private static currentContext: HttpContext | null = null;

	static setContext(ctx: HttpContext) {
		TenantController.currentContext = ctx;
	}

	static getCurrentTenant(): TenantContext | null {
		return TenantController.currentContext?.tenant || null;
	}

	static getCurrentSchoolId(): string | null {
		return TenantController.currentContext?.tenant?.schoolId || null;
	}

	static requireTenant(): TenantContext {
		const tenant = TenantController.getCurrentTenant();
		if (!tenant) {
			throw new Error("Tenant context is required but not available");
		}
		return tenant;
	}

	static scopeToTenant(query: any) {
		const schoolId = TenantController.getCurrentSchoolId();
		if (schoolId) {
			query.where("schoolId", schoolId);
		}
		return query;
	}

	// Actions HTTP pour gérer les tenants
	async current({ response }: HttpContext) {
		try {
			const tenant = TenantController.requireTenant();
			return response.ok({
				tenant: {
					schoolId: tenant.schoolId,
					slug: tenant.slug,
					name: tenant.school.name,
				},
			});
		} catch (_error) {
			return response.status(400).json({
				error: "No tenant context",
				message: "This endpoint requires a valid tenant subdomain",
			});
		}
	}

	async info(ctx: HttpContext) {
		const tenant = TenantController.getCurrentTenant();

		return ctx.response.ok({
			isTenantMode: !!tenant,
			isAdminMode: !!ctx.adminMode,
			tenant: tenant
				? {
						schoolId: tenant.schoolId,
						slug: tenant.slug,
						name: tenant.school.name,
					}
				: null,
		});
	}
}
