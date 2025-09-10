import type { HttpContext } from "@adonisjs/core/http";
import { DateTime } from "luxon";
import LeaderboardUserDto from "#dtos/leaderboard_user";
import QuestDto from "#dtos/quest";
import SchoolDto from "#dtos/school";
import Notification from "#models/notification";
import Quest from "#models/quest";
import User from "#models/user";
import type { PaginationMeta } from "#types/students";
import { createQuestValidator, updateQuestValidator } from "#validators/quest";

export default class QuestsController {
	async create({ request, response, school, auth }: HttpContext) {
		const user = auth.user;
		if (!user?.isAdmin()) {
			return response.forbidden({ message: "Admin access required" });
		}

		if (!school) {
			return response.badRequest({ message: "School not found" });
		}

		const { title, description, type, points, deadline, validationType } =
			await request.validateUsing(createQuestValidator);

		let parsedDeadline: DateTime | undefined;
		if (deadline) {
			parsedDeadline = DateTime.fromISO(deadline);

			if (!parsedDeadline.isValid) {
				return response.badRequest({
					errors: [
						{
							message: "La date limite doit être dans un format valide",
						},
					],
				});
			}

			if (parsedDeadline <= DateTime.now()) {
				return response.badRequest({
					errors: [
						{
							message: "La date limite doit être dans le futur",
						},
					],
				});
			}
		}

		const quest = await Quest.create({
			title,
			description,
			type,
			points: points || 0,
			deadline: parsedDeadline,
			validationType: validationType || "MANUAL",
			schoolId: school.id,
			isActive: true,
		});

		// Notify all students in the school about the new quest
		await Notification.notifyAllStudentsOfNewQuest(quest);

		return new QuestDto(quest);
	}

	async getQuests({ auth, request, response, school }: HttpContext) {
		const user = auth.user;
		if (!user) {
			return response.unauthorized({ message: "User not authenticated" });
		}

		if (!school) {
			return response.badRequest({ message: "School not found" });
		}

		const page = request.input("page", 1);
		const limit = request.input("limit", 10);
		const status = request.input("status", "all");

		let query = Quest.query()
			.where("schoolId", school.id)
			.where("isActive", true)
			.withCount("submissions")
			.preload("submissions", (submissionQuery) => {
				submissionQuery.where("userId", user.id);
			});

		if (status !== "all") {
			switch (status) {
				case "active":
					query = query.where((subQuery) => {
						subQuery
							.where("deadline", ">", DateTime.now().toSQL())
							.orWhereNull("deadline");
					});
					break;
				case "pending":
					query = query.whereHas("submissions", (subQuery) => {
						subQuery.where("userId", user.id).where("status", "PENDING");
					});
					break;
				case "completed":
					query = query.whereHas("submissions", (subQuery) => {
						subQuery.where("userId", user.id).where("status", "APPROVED");
					});
					break;
				case "rejected":
					query = query.whereHas("submissions", (subQuery) => {
						subQuery.where("userId", user.id).where("status", "REJECTED");
					});
					break;
				case "expired":
					query = query.where("deadline", "<", DateTime.now().toSQL());
					break;
			}
		}

		const quests = await query
			.orderBy("createdAt", "desc")
			.paginate(page, limit);

		const paginationMeta = quests.getMeta() as PaginationMeta;
		const questsData = quests.all().map((quest) => new QuestDto(quest));

		return {
			quests: questsData,
			meta: paginationMeta,
		};
	}

	async getQuest({ params, auth, response, school }: HttpContext) {
		const user = auth.user;
		if (!user) {
			return response.unauthorized({ message: "User not authenticated" });
		}

		const quest = await Quest.query()
			.where("id", params.id)
			.where("schoolId", school?.id ?? "")
			.first();

		if (!quest) {
			return response.notFound({ message: "Quest not found" });
		}

		return new QuestDto(quest);
	}

	async update({ params, request, response, school, auth }: HttpContext) {
		const user = auth.user;
		if (!user?.isAdmin()) {
			return response.forbidden({ message: "Admin access required" });
		}

		const quest = await Quest.query()
			.where("id", params.id)
			.where("schoolId", school?.id ?? "")
			.first();

		if (!quest) {
			return response.notFound({ message: "Quest not found" });
		}

		const {
			title,
			description,
			type,
			points,
			deadline,
			validationType,
			isActive,
		} = await request.validateUsing(updateQuestValidator);

		let parsedDeadline: DateTime | undefined;
		if (deadline) {
			parsedDeadline = DateTime.fromISO(deadline);

			if (!parsedDeadline.isValid) {
				return response.badRequest({
					errors: [
						{
							message: "La date limite doit être dans un format valide",
						},
					],
				});
			}

			if (parsedDeadline <= DateTime.now()) {
				return response.badRequest({
					errors: [
						{
							message: "La date limite doit être dans le futur",
						},
					],
				});
			}
		}

		quest.merge({
			title,
			description,
			type,
			points,
			deadline: parsedDeadline,
			validationType,
			isActive,
		});

		await quest.save();

		return new QuestDto(quest);
	}

	async destroy({ params, response, school, auth }: HttpContext) {
		const user = auth.user;
		if (!user?.isAdmin()) {
			return response.forbidden({ message: "Admin access required" });
		}

		const quest = await Quest.query()
			.where("id", params.id)
			.where("schoolId", school?.id ?? "")
			.first();

		if (!quest) {
			return response.notFound({ message: "Quest not found" });
		}

		await quest.delete();
		return response.ok({ message: "Quest deleted" });
	}

	async leaderboard({ auth, response, school, request }: HttpContext) {
		const user = auth.user;
		if (!user) {
			return response.unauthorized({ message: "User not authenticated" });
		}

		if (!school) {
			return response.badRequest({ message: "School not found" });
		}

		const page = request.input("page", 1);
		const limit = request.input("limit", 20);

		// Récupérer les étudiants de l'école triés par points décroissants avec pagination
		const students = await User.query()
			.where("schoolId", school.id)
			.where("role", "STUDENT")
			.where("isActive", true)
			.withCount("questSubmissions", (query) => {
				query.where("status", "APPROVED");
			})
			.orderBy("points", "desc")
			.orderBy("createdAt", "asc") // En cas d'égalité, prendre le plus ancien
			.paginate(page, limit);

		const paginationMeta = students.getMeta() as PaginationMeta;
		const leaderboardData = students.all().map((student, index) => {
			const rank = (page - 1) * limit + index + 1;
			const completedQuests = student.$extras.quest_submissions_count || 0;
			return new LeaderboardUserDto(student, rank, completedQuests).toJson();
		});

		return {
			leaderboard: leaderboardData,
			meta: paginationMeta,
			school: new SchoolDto(school),
		};
	}
}
