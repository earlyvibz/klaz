import type { HttpContext } from "@adonisjs/core/http";
import UserDto from "#dtos/user";
import User from "#models/user";
import type { PaginationMeta } from "#types/students";

export default class StudentsController {
	async getStudents({ request, school }: HttpContext) {
		const page = request.input("page", 1);
		const limit = request.input("limit", 10);

		let query = User.query()
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
			.orderBy("createdAt", "desc");

		query = query.where("schoolId", school?.id ?? "");

		const students = await query.paginate(page, limit);
		const paginationMeta = students.getMeta() as PaginationMeta;

		const studentsData = students
			.all()
			.sort((a: User, b: User) => {
				const nameA = (a.lastName || "").toLowerCase();
				const nameB = (b.lastName || "").toLowerCase();
				if (nameA < nameB) return -1;
				if (nameA > nameB) return 1;
				return 0;
			})
			.map((student: User) => new UserDto(student));

		return {
			students: studentsData,
			meta: paginationMeta,
		};
	}

	async getStudentsCount({ school }: HttpContext) {
		const count = await User.query()
			.where("role", "STUDENT")
			.where("isActive", true)
			.where("schoolId", school?.id ?? "")
			.count("* as total")
			.firstOrFail();

		return { count: Number(count.$extras.total) };
	}

	async detach({ params, auth, response, school }: HttpContext) {
		const user = auth.user;
		if (!user) {
			return response.unauthorized({ message: "User not authenticated" });
		}

		const { id } = params;

		let query = User.query().where("id", id).where("role", "STUDENT");

		if (school?.id) {
			query = query.where("schoolId", school.id);
		} else if (user.schoolId) {
			query = query.where("schoolId", user.schoolId);
		}

		const student = await query.first();

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
