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
import Notification from "#models/notification";
import QuestSubmission from "#models/quest_submission";
import RewardRedemption from "#models/reward_redemption";
import School from "#models/school";

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
		await this.save();
	}

	// Gamification methods
	calculateLevel(): number {
		// Formule exponentielle douce: niveau = floor(sqrt(points / 100)) + 1
		return Math.floor(Math.sqrt(this.points / 100)) + 1;
	}

	getPointsForNextLevel(): number {
		const nextLevel = this.level + 1;
		return (nextLevel - 1) ** 2 * 100;
	}

	getPointsForCurrentLevel(): number {
		if (this.level <= 1) return 0;
		return (this.level - 1) ** 2 * 100;
	}

	getLevelProgress(): number {
		const currentLevelPoints = this.getPointsForCurrentLevel();
		const nextLevelPoints = this.getPointsForNextLevel();
		if (nextLevelPoints === currentLevelPoints) return 1;
		const progress =
			(this.points - currentLevelPoints) /
			(nextLevelPoints - currentLevelPoints);
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
}
