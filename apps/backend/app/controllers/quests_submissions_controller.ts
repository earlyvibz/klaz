import type { HttpContext } from "@adonisjs/core/http";
import { DateTime } from "luxon";
import QuestSubmissionDto from "#dtos/quest_submission";
import Notification from "#models/notification";
import Quest from "#models/quest";
import QuestSubmission from "#models/quest_submission";
import type { PaginationMeta } from "#types/students";
import {
	reviewSubmissionValidator,
	submitQuestValidator,
} from "#validators/quest";

export default class QuestsSubmissionsController {
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

		// Check for existing submission
		const existingSubmission = await QuestSubmission.query()
			.where("userId", user.id)
			.where("questId", quest.id)
			.first();

		// Block if already pending or approved
		if (
			existingSubmission &&
			["PENDING", "APPROVED"].includes(existingSubmission.status)
		) {
			const statusMessage =
				existingSubmission.status === "PENDING"
					? "Quest submission is pending review"
					: "Quest already completed";
			return response.badRequest({ message: statusMessage });
		}

		// Conditional validation based on quest type
		const validatedData = await request.validateUsing(submitQuestValidator);

		if (quest.type === "SOCIAL") {
			if (
				!validatedData.description ||
				validatedData.description.trim().length === 0
			) {
				return response.badRequest({
					message:
						"La description est obligatoire pour les quêtes sociales (elle doit contenir le lien à vérifier)",
				});
			}
		}

		const { description } = validatedData;

		const imageUrl = await this.handleImageUpload(
			request,
			response,
			user.id,
			quest.id,
		);
		if (!imageUrl) return;

		let submission: QuestSubmission;

		if (existingSubmission && existingSubmission.status === "REJECTED") {
			// Update existing rejected submission
			existingSubmission.proofUrl = imageUrl;
			existingSubmission.studentComment = description;
			existingSubmission.status = "PENDING";
			existingSubmission.submittedAt = DateTime.now();
			existingSubmission.feedback = undefined; // Clear previous feedback
			await existingSubmission.save();
			submission = existingSubmission;
		} else {
			// Create new submission
			submission = await QuestSubmission.create({
				userId: user.id,
				questId: quest.id,
				proofUrl: imageUrl,
				studentComment: description,
				status: "PENDING",
				submittedAt: DateTime.now(),
			});
		}

		await submission.load("quest");
		return new QuestSubmissionDto(submission);
	}

	async approve({ params, request, response }: HttpContext) {
		const submission = await QuestSubmission.query()
			.where("id", params.submissionId)
			.preload("quest")
			.preload("user", (userQuery) => {
				userQuery.preload("school");
			})
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

			await submission.user.save();

			// Create quest approval notification
			await Notification.createQuestApprovalNotification(
				submission.user.id,
				submission,
				pointsToAward,
			);

			// Create level up notification if user leveled up
			if (hasLeveledUp) {
				await Notification.createLevelUpNotification(
					submission.user.id,
					submission.user.level,
					oldLevel,
				);
			}
		}

		return new QuestSubmissionDto(submission);
	}

	async reject({ params, request, response }: HttpContext) {
		const submission = await QuestSubmission.query()
			.where("id", params.submissionId)
			.preload("quest")
			.preload("user", (userQuery) => {
				userQuery.preload("school");
			})
			.first();

		if (!submission || !submission.quest) {
			return response.notFound({ message: "Submission not found" });
		}

		const { feedback } = await request.validateUsing(reviewSubmissionValidator);

		submission.status = "REJECTED";
		submission.feedback = feedback;
		await submission.save();

		// Create quest rejection notification
		if (submission.user) {
			await Notification.createQuestRejectionNotification(
				submission.user.id,
				submission,
				feedback,
			);
		}

		return new QuestSubmissionDto(submission);
	}

	async index({ request }: HttpContext) {
		const page = request.input("page", 1);
		const limit = request.input("limit", 20);
		const status = request.input("status");

		// New filter parameters
		const search = request.input("search");
		const schoolId = request.input("school");
		const questId = request.input("quest");
		const dateFrom = request.input("dateFrom");
		const dateTo = request.input("dateTo");
		const pointsMin = request.input("pointsMin");
		const pointsMax = request.input("pointsMax");
		const olderThan = request.input("olderThan"); // days
		const hasComment = request.input("hasComment");

		const query = QuestSubmission.query()
			.preload("quest")
			.preload("user", (userQuery) => {
				userQuery.preload("school");
			})
			.orderBy("submittedAt", "desc");

		if (status) {
			query.where("status", status);
		}

		// Search filter (student name or email)
		if (search) {
			query.whereHas("user", (userQuery) => {
				userQuery
					.whereILike("firstName", `%${search}%`)
					.orWhereILike("lastName", `%${search}%`)
					.orWhereILike("email", `%${search}%`);
			});
		}

		// School filter
		if (schoolId) {
			query.whereHas("user", (userQuery) => {
				userQuery.where("schoolId", schoolId);
			});
		}

		// Quest filter
		if (questId) {
			query.where("questId", questId);
		}

		// Date range filter
		if (dateFrom) {
			query.where("submittedAt", ">=", dateFrom);
		}
		if (dateTo) {
			query.where("submittedAt", "<=", dateTo);
		}

		// Points range filter
		if (pointsMin || pointsMax) {
			query.whereHas("quest", (questQuery) => {
				if (pointsMin) questQuery.where("points", ">=", pointsMin);
				if (pointsMax) questQuery.where("points", "<=", pointsMax);
			});
		}

		// Older than filter (for pending submissions)
		if (olderThan && status === "PENDING") {
			const daysAgo = new Date();
			daysAgo.setDate(daysAgo.getDate() - Number(olderThan));
			query.where("submittedAt", "<=", daysAgo.toISOString());
		}

		// Comment filter (for reviewed submissions)
		if (hasComment !== undefined) {
			if (hasComment === "true") {
				query.whereNotNull("feedback").where("feedback", "!=", "");
			} else if (hasComment === "false") {
				query.whereNull("feedback").orWhere("feedback", "=", "");
			}
		}

		const submissions = await query.paginate(page, limit);
		const meta = submissions.getMeta() as PaginationMeta;
		const data = submissions
			.all()
			.map((sub) => new QuestSubmissionDto(sub).toJson());

		return {
			submissions: data,
			meta,
		};
	}

	private async findActiveQuest(questId: string, schoolId?: string) {
		if (!schoolId) {
			return null;
		}

		return Quest.query()
			.where("id", questId)
			.where("schoolId", schoolId)
			.where("isActive", true)
			.first();
	}

	private isQuestExpired(quest: Quest) {
		return quest.deadline && quest.deadline < DateTime.now();
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
		return image.meta.url;
	}
}
