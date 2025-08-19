import type { HttpContext } from "@adonisjs/core/http";
import type { NextFn } from "@adonisjs/core/types/http";
import School from "#models/school";
import "#types/tenant";

export default class TenantMiddleware {
	async handle(ctx: HttpContext, next: NextFn) {
		const origin = ctx.request.header("origin");
		if (!origin) {
			return ctx.response.badRequest({ error: "Origin required" });
		}

		const url = new URL(origin);
		const subdomain = url.hostname.split(".")[0];

		if (subdomain === "admin" || subdomain === "auth") {
			ctx.school = null;
			return next();
		}

		const school = await School.findBy("slug", subdomain);
		if (!school) {
			return ctx.response.notFound({ error: "School not found" });
		}

		ctx.school = school;
		return next();
	}
}
