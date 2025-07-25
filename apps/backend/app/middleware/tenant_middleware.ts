import type { HttpContext } from "@adonisjs/core/http";
import type { NextFn } from "@adonisjs/core/types/http";
import TenantController from "#controllers/tenant_controller";
import School from "#models/school";
import "#types/tenant";

export default class TenantMiddleware {
	async handle(
		ctx: HttpContext,
		next: NextFn,
		options: { required?: boolean } = {},
	) {
		// Initialiser les propriétés par défaut
		ctx.tenant = null;
		ctx.adminMode = false;

		// Extraire le subdomain depuis l'origin de la requête
		let subdomain: string | null = null;
		const origin = ctx.request.header("origin");

		if (origin) {
			try {
				const url = new URL(origin);
				const hostname = url.hostname;

				if (hostname.includes(".")) {
					const parts = hostname.split(".");
					const potentialSubdomain = parts[0];
					// Extraire tous les subdomains sauf www et localhost
					if (
						potentialSubdomain &&
						potentialSubdomain !== "www" &&
						potentialSubdomain !== "localhost"
					) {
						subdomain = potentialSubdomain;
					}
				}
			} catch (_error) {
				// Invalid origin URL, ignore silently
			}
		}

		// Détecter le mode admin
		const isAdminMode = subdomain === "admin";

		// Si pas de subdomain ou mode admin, c'est le mode global
		if (!subdomain || isAdminMode) {
			ctx.adminMode = isAdminMode;
			if (options.required) {
				return ctx.response.status(400).json({
					error: "Tenant required",
					message: "This endpoint requires a valid tenant subdomain",
				});
			}
			return next();
		}

		// Résoudre l'école par le slug
		const school = await School.findBy("slug", subdomain);

		if (!school) {
			ctx.tenant = null;
			if (options.required) {
				return ctx.response.status(404).json({
					error: "Tenant not found",
					message: `School with slug "${subdomain}" does not exist`,
				});
			}
			return next();
		}

		// Stocker l'école dans le contexte
		ctx.tenant = {
			school,
			schoolId: school.id,
			slug: school.slug,
		};

		// Configurer le contrôleur tenant
		TenantController.setContext(ctx);

		return next();
	}
}
