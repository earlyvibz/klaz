import type { HttpContext } from "@adonisjs/core/http";
import { DateTime } from "luxon";
import QuestDto from "#dtos/quest";
import QuestSubmissionDto from "#dtos/quest_submission";
import Quest from "#models/quest";
import QuestSubmission from "#models/quest_submission";
import User from "#models/user";
import {
	createQuestValidator,
	reviewSubmissionValidator,
	updateQuestValidator,
} from "#validators/quest";

export default class QuestsController {
	async index({ auth, request, response, school }: HttpContext) {
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
				case "available":
					query = query.whereDoesntHave("submissions", (subQuery) => {
						subQuery.where("userId", user.id);
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

		const paginationMeta = quests.getMeta();
		const questsData = quests.all().map((quest) => new QuestDto(quest));

		return {
			quests: questsData,
			meta: paginationMeta,
		};
	}

	async show({ params, auth, response, school }: HttpContext) {
		const user = auth.user;
		if (!user) {
			return response.unauthorized({ message: "User not authenticated" });
		}

		const quest = await Quest.query()
			.where("id", params.id)
			.where("schoolId", school?.id ?? "")
			.preload("submissions", (query) => {
				if (user.role === "STUDENT") {
					query.where("userId", user.id);
				}
				query.preload("user");
			})
			.first();

		if (!quest) {
			return response.notFound({ message: "Quest not found" });
		}

		return new QuestDto(quest);
	}

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

		const quest = await Quest.create({
			title,
			description,
			type,
			points: points || 0,
			deadline: deadline ? DateTime.fromJSDate(deadline) : undefined,
			validationType: validationType || "MANUAL",
			schoolId: school.id,
			isActive: true,
		});

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

		quest.merge({
			title,
			description,
			type,
			points,
			deadline: deadline ? DateTime.fromJSDate(deadline) : undefined,
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

	async submit({ params, request, response, auth, school }: HttpContext) {
		const user = auth.user;
		if (!user || user.role !== "STUDENT") {
			return response.forbidden({ message: "Student access required" });
		}

		const quest = await this.findActiveQuest(params.id, school?.id);
		if (!quest) {
			return response.notFound({ message: "Quest not found" });
		}

		if (this.isQuestExpired(quest)) {
			return response.badRequest({ message: "Quest deadline has passed" });
		}

		const hasExistingSubmission = await this.hasUserSubmitted(
			user.id,
			quest.id,
		);

		if (hasExistingSubmission) {
			return response.badRequest({ message: "Quest already submitted" });
		}

		const imageUrl = await this.handleImageUpload(
			request,
			response,
			user.id,
			quest.id,
		);
		if (!imageUrl) return;

		const submission = await QuestSubmission.create({
			userId: user.id,
			questId: quest.id,
			proofUrl: imageUrl,
			status: "PENDING",
			submittedAt: DateTime.now(),
		});

		await submission.load("quest");
		return new QuestSubmissionDto(submission);
	}

	private async findActiveQuest(questId: string, schoolId?: string) {
		return Quest.query()
			.where("id", questId)
			.where("schoolId", schoolId ?? "")
			.where("isActive", true)
			.first();
	}

	private isQuestExpired(quest: Quest) {
		return quest.deadline && quest.deadline < DateTime.now();
	}

	private async hasUserSubmitted(userId: string, questId: string) {
		const existingSubmission = await QuestSubmission.query()
			.where("userId", userId)
			.where("questId", questId)
			.first();

		return !!existingSubmission;
	}

	private async handleImageUpload(
		request: HttpContext["request"],
		response: HttpContext["response"],
		userId: string,
		questId: string,
	) {
		const image = request.file("image", {
			size: "2mb",
			extnames: ["jpeg", "jpg", "png"],
		});

		if (!image) {
			response.badRequest({ error: "Image missing" });
			return null;
		}

		const timestamp = DateTime.now().toFormat("yyyyMMdd-HHmmss");
		const key = `uploads/quest-${questId}/user-${userId}-${timestamp}.${image.extname}`;
		await image.moveToDisk(key);
		return key;
	}

	async approveSubmission({
		params,
		request,
		response,
		auth,
		school,
	}: HttpContext) {
		const user = auth.user;
		if (!user?.isAdmin()) {
			return response.forbidden({ message: "Admin access required" });
		}

		const submission = await QuestSubmission.query()
			.where("id", params.submissionId)
			.preload("quest", (query) => {
				query.where("schoolId", school?.id ?? "");
			})
			.preload("user")
			.first();

		if (!submission || !submission.quest) {
			return response.notFound({ message: "Submission not found" });
		}

		const { feedback } = await request.validateUsing(reviewSubmissionValidator);

		submission.status = "APPROVED";
		submission.feedback = feedback;
		await submission.save();

		// Attribuer les points avec gamification
		if (submission.user && submission.quest) {
			const pointsToAward = await submission.quest.calculatePointsForUser(
				submission.user,
			);

			const oldLevel = submission.user.level;
			submission.user.points += pointsToAward;
			const hasLeveledUp = await submission.user.updateLevel();

			console.log(
				`🎮 User ${submission.user.id}: +${pointsToAward} points - Quest completed: ${submission.quest.title}`,
			);

			if (hasLeveledUp) {
				console.log(
					`🎉 User ${submission.user.email} leveled up from ${oldLevel} to ${submission.user.level}!`,
				);
			}
		}

		return new QuestSubmissionDto(submission);
	}

	async rejectSubmission({
		params,
		request,
		response,
		auth,
		school,
	}: HttpContext) {
		const user = auth.user;
		if (!user?.isAdmin()) {
			return response.forbidden({ message: "Admin access required" });
		}

		const submission = await QuestSubmission.query()
			.where("id", params.submissionId)
			.preload("quest", (query) => {
				query.where("schoolId", school?.id ?? "");
			})
			.first();

		if (!submission || !submission.quest) {
			return response.notFound({ message: "Submission not found" });
		}

		const { feedback } = await request.validateUsing(reviewSubmissionValidator);

		submission.status = "REJECTED";
		submission.feedback = feedback;
		await submission.save();

		return new QuestSubmissionDto(submission);
	}

	async submissions({ auth, response, school, request }: HttpContext) {
		const user = auth.user;
		if (!user?.isAdmin()) {
			return response.forbidden({ message: "Admin access required" });
		}

		const page = request.input("page", 1);
		const limit = request.input("limit", 20);
		const status = request.input("status");

		const query = QuestSubmission.query()
			.preload("quest", (questQuery) => {
				questQuery.where("schoolId", school?.id ?? "");
			})
			.preload("user")
			.orderBy("submittedAt", "desc");

		if (status) {
			query.where("status", status);
		}

		const submissions = await query.paginate(page, limit);
		const meta = submissions.getMeta();
		const data = submissions.all().map((sub) => new QuestSubmissionDto(sub));

		return {
			submissions: data,
			meta,
		};
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

		const paginationMeta = students.getMeta();
		const leaderboardData = students.all().map((student, index) => ({
			rank: (page - 1) * limit + index + 1, // Calculer le rang global
			id: student.id,
			firstName: student.firstName,
			lastName: student.lastName,
			points: student.points,
			level: student.level,
			completedQuests: student.$extras.quest_submissions_count || 0,
		}));

		return {
			leaderboard: leaderboardData,
			meta: paginationMeta,
			school: {
				id: school.id,
				name: school.name,
			},
		};
	}
}
