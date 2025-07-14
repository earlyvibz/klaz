import type { HttpContext } from "@adonisjs/core/http";
import User from "#models/user";
import { StudentDto } from "../dtos/student_dto.js";

export default class StudentsController {
	async index({ params, request, auth, response }: HttpContext) {
		const user = auth.user;
		if (!user) {
			return response.unauthorized({ message: "User not authenticated" });
		}

		const { schoolId } = params;

		if (!user.canManageSchool(schoolId)) {
			return response.forbidden({
				message: "You can only access students from your own school",
			});
		}

		const page = request.input("page", 1);
		const limit = request.input("limit", 10);

		const students = await User.query()
			.where("schoolId", schoolId)
			.where("role", "STUDENT")
			.where("isActive", true)
			.preload("group")
			.select([
				"id",
				"fullName",
				"email",
				"level",
				"points",
				"groupId",
				"createdAt",
				"lastLoginAt",
			])
			.orderBy("createdAt", "desc")
			.paginate(page, limit);

		// Utiliser le DTO pour sérialiser les données
		const paginationMeta = students.getMeta();
		const studentsData = StudentDto.fromUsers(students.all());

		return response.ok({
			data: studentsData,
			meta: paginationMeta,
		});
	}
}
