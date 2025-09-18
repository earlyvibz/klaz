import { withAuthFinder } from "@adonisjs/auth/mixins/lucid";
import { compose } from "@adonisjs/core/helpers";
import hash from "@adonisjs/core/services/hash";
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
import Badge from "#models/badge";
import Notification from "#models/notification";
import QuestSubmission from "#models/quest_submission";
import RewardRedemption from "#models/reward_redemption";
import School from "#models/school";
import UserBadge from "#models/user_badge";

const AuthFinder = withAuthFinder(() => hash.use("scrypt"), {
	uids: ["email"],
	passwordColumnName: "password",
});

export default class User extends compose(BaseModel, AuthFinder) {
	static table = "users";

	@column({ isPrimary: true })
	declare id: string;

	@column()
	declare firstName: string | null;

	@column()
	declare lastName: string | null;

	@column()
	declare email: string;

	@column({ serializeAs: null })
	declare password: string;

	@column()
	declare role: "STUDENT" | "ADMIN" | "SUPERADMIN";

	@column()
	declare level: number;

	@column()
	declare points: number;

	@column()
	declare exp: number;

	@column()
	declare schoolId: string | null;

	@column()
	declare isActive: boolean;

	@column()
	declare resetPasswordToken: string | null;

	@column.dateTime()
	declare resetPasswordExpires: DateTime | null;

	@column.dateTime()
	declare lastLoginAt: DateTime | null;

	@column()
	declare failedLoginAttempts: number;

	@column()
	declare emailVerified: boolean;

	@column()
	declare emailVerificationToken: string | null;

	@column.dateTime({ autoCreate: true })
	declare createdAt: DateTime;

	@column.dateTime({ autoCreate: true, autoUpdate: true })
	declare updatedAt: DateTime | null;

	@belongsTo(() => School, { foreignKey: "schoolId" })
	declare school: BelongsTo<typeof School>;

	@hasMany(() => QuestSubmission)
	declare questSubmissions: HasMany<typeof QuestSubmission>;

	@hasMany(() => RewardRedemption)
	declare rewardRedemptions: HasMany<typeof RewardRedemption>;

	@hasMany(() => Notification)
	declare notifications: HasMany<typeof Notification>;

	@hasMany(() => UserBadge)
	declare userBadges: HasMany<typeof UserBadge>;

	@beforeCreate()
	public static async assignId(model: User) {
		model.id = uuidv4();
	}

	// Role helper methods
	isStudent(): boolean {
		return this.role === "STUDENT";
	}

	isAdmin(): boolean {
		return this.role === "ADMIN";
	}

	isSuperAdmin(): boolean {
		return this.role === "SUPERADMIN";
	}

	hasAdminRights(): boolean {
		return this.isAdmin() || this.isSuperAdmin();
	}

	canManageSchool(schoolId: string): boolean {
		return (
			this.isSuperAdmin() || (this.isAdmin() && this.schoolId === schoolId)
		);
	}

	async generatePasswordResetToken(): Promise<string> {
		const token = uuidv4();
		this.resetPasswordToken = token;
		this.resetPasswordExpires = DateTime.now().plus({ hours: 2 });
		await this.save();
		return token;
	}

	async clearPasswordResetToken(): Promise<void> {
		this.resetPasswordToken = null;
		this.resetPasswordExpires = null;
		await this.save();
	}

	isPasswordResetTokenValid(token: string): boolean {
		if (!this.resetPasswordToken || !this.resetPasswordExpires) return false;
		return (
			this.resetPasswordToken === token &&
			this.resetPasswordExpires > DateTime.now()
		);
	}

	async generateEmailVerificationToken(): Promise<string> {
		const token = uuidv4();
		this.emailVerificationToken = token;
		await this.save();
		return token;
	}

	async verifyEmail(token: string): Promise<boolean> {
		if (this.emailVerificationToken !== token) return false;
		this.emailVerified = true;
		this.emailVerificationToken = null;
		await this.save();
		return true;
	}

	// School attachment helper methods
	isDetached(): boolean {
		return this.schoolId === null;
	}

	needsSchoolAttachment(): boolean {
		return this.isActive && this.isDetached() && this.role === "STUDENT";
	}

	async detachFromSchool(): Promise<void> {
		this.schoolId = null;
		this.level = 1;
		this.points = 0;
		this.exp = 0;
		await this.save();
	}

	// Gamification methods
	calculateLevel(): number {
		// Formule exponentielle douce basée sur EXP: niveau = floor(sqrt(exp / 100)) + 1
		return Math.floor(Math.sqrt(this.exp / 100)) + 1;
	}

	getExpForNextLevel(): number {
		const nextLevel = this.level + 1;
		return (nextLevel - 1) ** 2 * 100;
	}

	getExpForCurrentLevel(): number {
		if (this.level <= 1) return 0;
		return (this.level - 1) ** 2 * 100;
	}

	getLevelProgress(): number {
		const currentLevelExp = this.getExpForCurrentLevel();
		const nextLevelExp = this.getExpForNextLevel();
		if (nextLevelExp === currentLevelExp) return 1;
		const progress =
			(this.exp - currentLevelExp) / (nextLevelExp - currentLevelExp);
		return Math.max(0, Math.min(1, progress));
	}

	async updateLevel(): Promise<boolean> {
		const newLevel = this.calculateLevel();
		const hasLeveledUp = newLevel > this.level;

		if (hasLeveledUp) {
			this.level = newLevel;
			await this.save();
		}

		return hasLeveledUp;
	}

	// Badge methods
	async checkAndAwardBadges(): Promise<Badge[]> {
		const awardedBadges: Badge[] = [];

		// Récupérer tous les badges actifs
		const availableBadges = await Badge.query().where("isActive", true);

		// Récupérer les badges déjà obtenus par l'utilisateur
		const existingBadges = await UserBadge.query()
			.where("userId", this.id)
			.preload("badge");
		const existingBadgeIds = existingBadges.map((ub) => ub.badgeId);

		// Compter les quêtes complétées
		const completedQuests = await QuestSubmission.query()
			.where("userId", this.id)
			.where("status", "APPROVED")
			.count("* as total");
		const questCount = Number(completedQuests[0].$extras.total);

		for (const badge of availableBadges) {
			// Vérifier si l'utilisateur a déjà ce badge
			if (existingBadgeIds.includes(badge.id)) continue;

			let shouldAward = false;

			// Vérifier les conditions du badge
			if (badge.requiredLevel && this.level >= badge.requiredLevel) {
				shouldAward = true;
			}
			if (badge.requiredQuests && questCount >= badge.requiredQuests) {
				shouldAward = true;
			}
			if (badge.requiredPoints && this.points >= badge.requiredPoints) {
				shouldAward = true;
			}

			if (shouldAward) {
				// Attribuer le badge
				await UserBadge.create({
					userId: this.id,
					badgeId: badge.id,
					earnedAt: DateTime.now(),
				});
				awardedBadges.push(badge);
			}
		}

		return awardedBadges;
	}

	async getBadges(): Promise<Badge[]> {
		const userBadges = await UserBadge.query()
			.where("userId", this.id)
			.preload("badge")
			.orderBy("earnedAt", "desc");

		return userBadges.map((ub) => ub.badge);
	}

	async getCurrentBadge(): Promise<Badge | null> {
		// Get all level badges and find the highest one
		const userBadges = await UserBadge.query()
			.where("userId", this.id)
			.preload("badge")
			.whereHas("badge", (badgeQuery) => {
				badgeQuery.whereNotNull("requiredLevel");
			});

		// Sort by required level and get the highest
		const highestBadge = userBadges
			.filter(
				(ub) => ub.badge.requiredLevel && ub.badge.requiredLevel <= this.level,
			)
			.sort(
				(a, b) => (b.badge.requiredLevel || 0) - (a.badge.requiredLevel || 0),
			)[0];

		return highestBadge?.badge || null;
	}

	getCurrentBadgeTitle(): string {
		// This will be populated when badges are loaded
		const currentBadge = this.userBadges?.find(
			(ub) => ub.badge.requiredLevel && ub.badge.requiredLevel <= this.level,
		)?.badge;

		return currentBadge?.name || "Étudiant";
	}
}
