import type { HttpContext } from "@adonisjs/core/http";
import User from "#models/user";
import StudentDto from "../dtos/student_dto.js";

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
				"firstName",
				"lastName",
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
		const studentsData = students
			.all()
			.map((student) => new StudentDto(student));

		return response.ok({
			data: studentsData,
			meta: paginationMeta,
		});
	}

	async detach({ params, auth, response }: HttpContext) {
		const user = auth.user;
		if (!user) {
			return response.unauthorized({ message: "User not authenticated" });
		}

		const { schoolId, id } = params;

		if (!user.canManageSchool(schoolId)) {
			return response.forbidden({
				message: "You can only manage students from your own school",
			});
		}

		const student = await User.query()
			.where("id", id)
			.where("schoolId", schoolId)
			.where("role", "STUDENT")
			.first();

		if (!student) {
			return response.notFound({ message: "Student not found" });
		}

		if (!student.isActive) {
			return response.badRequest({ message: "Student is already inactive" });
		}

		await student.detachFromSchool();

		return response.ok({
			message: "Student detached from school successfully",
			student: {
				id: student.id,
				email: student.email,
				firstName: student.firstName,
				lastName: student.lastName,
				isActive: student.isActive,
				schoolId: student.schoolId,
				groupId: student.groupId,
				level: student.level,
				points: student.points,
			},
		});
	}
}
