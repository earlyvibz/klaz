import type { HttpContext } from "@adonisjs/core/http";
import School from "#models/school";
import SchoolDto from "../dtos/school_dto.js";

export default class SchoolsController {
	async index({ auth, request, response }: HttpContext) {
		const user = auth.user;
		if (!user) {
			return response.unauthorized({ message: "User not authenticated" });
		}

		if (!user.isSuperAdmin()) {
			return response.forbidden({ message: "Super admin access required" });
		}

		const page = request.input("page", 1);
		const limit = request.input("limit", 10);

		const schools = await School.query()
			.select("id", "name", "slug", "createdAt", "updatedAt")
			.withCount("users")
			.withCount("groups")
			.orderBy("name", "asc")
			.paginate(page, limit);

		const paginationMeta = schools.getMeta();
		const schoolsData = schools.all().map((school) => new SchoolDto(school));

		return response.ok({
			data: schoolsData,
			meta: paginationMeta,
		});
	}
}
