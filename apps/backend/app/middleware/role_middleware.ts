import type { HttpContext } from "@adonisjs/core/http";
import type { NextFn } from "@adonisjs/core/types/http";

export default class RoleMiddleware {
	async handle(
		{ auth, response }: HttpContext,
		next: NextFn,
		options: { roles?: string[]; requireAdmin?: boolean },
	) {
		const user = auth.user;
		if (!user) return response.unauthorized();

		if (options.requireAdmin && !user.hasAdminRights()) {
			return response.forbidden({
				message: "Admin rights required",
			});
		}

		// Si des rôles spécifiques sont requis
		if (options.roles && options.roles.length > 0) {
			if (!options.roles.includes(user.role)) {
				return response.forbidden({
					message: `Required role: ${options.roles.join(" or ")}`,
				});
			}
		}

		return await next();
	}
}
