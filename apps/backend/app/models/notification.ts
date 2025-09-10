import {
	BaseModel,
	beforeCreate,
	belongsTo,
	column,
} from "@adonisjs/lucid/orm";
import type { BelongsTo } from "@adonisjs/lucid/types/relations";
import { DateTime } from "luxon";
import { v4 as uuidv4 } from "uuid";
import Quest from "#models/quest";
import QuestSubmission from "#models/quest_submission";
import User from "#models/user";

export type NotificationType =
	| "QUEST_APPROVED"
	| "QUEST_REJECTED"
	| "NEW_QUEST"
	| "LEVEL_UP";

export default class Notification extends BaseModel {
	@column({ isPrimary: true })
	declare id: string;

	@column()
	declare userId: string;

	@column()
	declare questId: string | null;

	@column()
	declare questSubmissionId: string | null;

	@column()
	declare type: NotificationType;

	@column()
	declare title: string;

	@column()
	declare message: string;

	@column()
	declare isRead: boolean;

	@column({
		prepare: (value: unknown) => {
			if (typeof value === "string") return value;
			return value ? JSON.stringify(value) : null;
		},
		consume: (value: string) => {
			if (!value) return null;
			try {
				return typeof value === "string" ? JSON.parse(value) : value;
			} catch {
				return null;
			}
		},
	})
	declare metadata: Record<string, unknown> | null;

	@column.dateTime({ autoCreate: true })
	declare createdAt: DateTime;

	@column.dateTime({ autoCreate: true, autoUpdate: true })
	declare updatedAt: DateTime;

	@belongsTo(() => User)
	declare user: BelongsTo<typeof User>;

	@belongsTo(() => Quest)
	declare quest: BelongsTo<typeof Quest>;

	@belongsTo(() => QuestSubmission)
	declare questSubmission: BelongsTo<typeof QuestSubmission>;

	@beforeCreate()
	public static async assignId(model: Notification) {
		model.id = uuidv4();
	}

	// Helper method to mark as read
	async markAsRead(): Promise<void> {
		if (!this.isRead) {
			this.isRead = true;
			await this.save();
		}
	}

	// Factory methods for different notification types
	static async createQuestApprovalNotification(
		userId: string,
		questSubmission: QuestSubmission,
		pointsAwarded: number,
	): Promise<Notification> {
		await questSubmission.load("quest");

		return Notification.create({
			userId,
			questId: questSubmission.quest.id,
			questSubmissionId: questSubmission.id,
			type: "QUEST_APPROVED",
			title: "Quête approuvée ! 🎉",
			message: `Votre soumission pour "${questSubmission.quest.title}" a été approuvée. Vous avez gagné ${pointsAwarded} points !`,
			isRead: false,
			metadata: {
				pointsAwarded,
				questTitle: questSubmission.quest.title,
				questType: questSubmission.quest.type,
			},
		});
	}

	static async createQuestRejectionNotification(
		userId: string,
		questSubmission: QuestSubmission,
		feedback?: string,
	): Promise<Notification> {
		await questSubmission.load("quest");

		const message = feedback
			? `Votre soumission pour "${questSubmission.quest.title}" a été rejetée. Commentaire: ${feedback}`
			: `Votre soumission pour "${questSubmission.quest.title}" a été rejetée. Vous pouvez la resoumettre après correction.`;

		return Notification.create({
			userId,
			questId: questSubmission.quest.id,
			questSubmissionId: questSubmission.id,
			type: "QUEST_REJECTED",
			title: "Quête rejetée",
			message,
			isRead: false,
			metadata: {
				questTitle: questSubmission.quest.title,
				questType: questSubmission.quest.type,
				feedback,
			},
		});
	}

	static async createNewQuestNotification(
		userId: string,
		quest: Quest,
	): Promise<Notification> {
		return Notification.create({
			userId,
			questId: quest.id,
			questSubmissionId: null,
			type: "NEW_QUEST",
			title: "Nouvelle quête disponible ! 🚀",
			message: `Une nouvelle quête "${quest.title}" est maintenant disponible. ${quest.points} points à gagner !`,
			isRead: false,
			metadata: {
				questTitle: quest.title,
				questType: quest.type,
				questPoints: quest.points,
				deadline: quest.deadline?.toISO(),
			},
		});
	}

	static async createLevelUpNotification(
		userId: string,
		newLevel: number,
		oldLevel: number,
	): Promise<Notification> {
		return Notification.create({
			userId,
			questId: null,
			questSubmissionId: null,
			type: "LEVEL_UP",
			title: `Niveau ${newLevel} atteint ! 🎯`,
			message: `Félicitations ! Vous êtes passé du niveau ${oldLevel} au niveau ${newLevel} !`,
			isRead: false,
			metadata: {
				newLevel,
				oldLevel,
				levelGain: newLevel - oldLevel,
			},
		});
	}

	// Bulk operations for new quests
	static async notifyAllStudentsOfNewQuest(quest: Quest): Promise<void> {
		// Get all active students from the same school
		const students = await User.query()
			.where("schoolId", quest.schoolId)
			.where("role", "STUDENT")
			.where("isActive", true);

		// Create notifications for all students
		const notifications = students.map((student) => ({
			id: uuidv4(),
			userId: student.id,
			questId: quest.id,
			questSubmissionId: null,
			type: "NEW_QUEST" as NotificationType,
			title: "Nouvelle quête disponible ! 🚀",
			message: `Une nouvelle quête "${quest.title}" est maintenant disponible. ${quest.points} points à gagner !`,
			isRead: false,
			metadata: {
				questTitle: quest.title,
				questType: quest.type,
				questPoints: quest.points,
				deadline: quest.deadline?.toISO(),
			},
			createdAt: DateTime.now(),
			updatedAt: DateTime.now(),
		}));

		if (notifications.length > 0) {
			await Notification.createMany(notifications);
		}
	}
}
