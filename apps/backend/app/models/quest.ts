import {
	BaseModel,
	beforeCreate,
	belongsTo,
	column,
	hasMany,
} from "@adonisjs/lucid/orm";
import type { BelongsTo, HasMany } from "@adonisjs/lucid/types/relations";
import { DateTime } from "luxon";
import { v4 as uuidv4 } from "uuid";
import QuestSubmission from "#models/quest_submission";
import School from "#models/school";
import type User from "#models/user";

export default class Quest extends BaseModel {
	@column({ isPrimary: true })
	declare id: string;

	@column()
	declare title: string;

	@column()
	declare description: string;

	@column()
	declare type: string; // ex: 'UGC', 'SOCIAL', 'EVENT'

	@column()
	declare points: number;

	@column.dateTime({ autoCreate: false })
	declare deadline?: DateTime;

	@column()
	declare validationType: "MANUAL" | "AUTO_API";

	@column()
	declare schoolId: string;

	@column()
	declare isActive: boolean;

	@belongsTo(() => School)
	declare school: BelongsTo<typeof School>;

	@hasMany(() => QuestSubmission)
	declare submissions: HasMany<typeof QuestSubmission>;

	@column.dateTime({ autoCreate: true })
	declare createdAt: DateTime;

	@column.dateTime({ autoCreate: true, autoUpdate: true })
	declare updatedAt: DateTime;

	@beforeCreate()
	public static async assignId(model: Quest) {
		model.id = uuidv4();
	}

	// Gamification methods
	async isFirstTimeForUser(user: User): Promise<boolean> {
		const previousSubmissions = await QuestSubmission.query()
			.where("userId", user.id)
			.where("status", "APPROVED")
			.count("* as total");

		return previousSubmissions[0].$extras.total === 0;
	}

	async getUserStreak(user: User): Promise<number> {
		// Calculer le streak de quêtes consécutives (derniers 7 jours)
		const recentSubmissions = await QuestSubmission.query()
			.where("userId", user.id)
			.where("status", "APPROVED")
			.where("submittedAt", ">=", DateTime.now().minus({ days: 7 }).toSQL())
			.orderBy("submittedAt", "desc");

		// Compter les jours consécutifs
		let streak = 0;
		const today = DateTime.now().startOf("day");

		for (const submission of recentSubmissions) {
			const submissionDay = DateTime.fromISO(
				submission.submittedAt.toString(),
			).startOf("day");
			const daysDiff = today.diff(submissionDay, "days").days;

			if (daysDiff === streak) {
				streak++;
			} else {
				break;
			}
		}

		return streak;
	}

	isWeekend(): boolean {
		return [0, 6].includes(new Date().getDay());
	}

	async calculatePointsForUser(user: User): Promise<number> {
		const basePoints = this.points;
		const isFirstTime = await this.isFirstTimeForUser(user);
		const streak = await this.getUserStreak(user);
		const isWeekend = this.isWeekend();

		let finalPoints = basePoints;

		// Bonus première fois
		if (isFirstTime) {
			finalPoints *= 1.5;
		}

		// Bonus streak
		if (streak >= 3) {
			finalPoints *= 1.2;
		}

		// Bonus weekend
		if (isWeekend) {
			finalPoints *= 1.1;
		}

		// Bonus par type de quête
		switch (this.type) {
			case "RARE":
				finalPoints *= 2.0;
				break;
			case "EVENT":
				finalPoints *= 1.3;
				break;
			case "WEEKLY":
				finalPoints *= 1.2;
				break;
		}

		return Math.floor(finalPoints);
	}
}
