import type { HttpContext } from "@adonisjs/core/http";
import SchoolDto from "#dtos/school";
import School from "#models/school";

export default class SchoolsController {
	async current({ response, school }: HttpContext) {
		if (!school) {
			return response.notFound({ message: "School not found" });
		}

		if (!school) {
			return response.notFound({ message: "School not found" });
		}

		return new SchoolDto(school);
	}

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

		return {
			schools: schoolsData,
			meta: paginationMeta,
		};
	}

	async create({ request }: HttpContext) {
		const { name, slug } = request.only(["name", "slug"]);

		const school = await School.create({ name, slug });

		return new SchoolDto(school);
	}
}
