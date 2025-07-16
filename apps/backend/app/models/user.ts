import { DbAccessTokensProvider } from "@adonisjs/auth/access_tokens";
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
import Group from "#models/group";
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
	declare groupId: string | null;

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

	@column.dateTime()
	declare lockedUntil: DateTime | null;

	@column()
	declare emailVerified: boolean;

	@column()
	declare emailVerificationToken: string | null;

	@column.dateTime({ autoCreate: true })
	declare createdAt: DateTime;

	@column.dateTime({ autoCreate: true, autoUpdate: true })
	declare updatedAt: DateTime | null;

	// Helper methods for name handling
	get displayName(): string {
		if (this.firstName && this.lastName) {
			return `${this.firstName} ${this.lastName}`;
		}
		return this.firstName || this.lastName || this.email;
	}

	get initials(): string {
		const firstInitial = this.firstName?.charAt(0)?.toUpperCase() || "";
		const lastInitial = this.lastName?.charAt(0)?.toUpperCase() || "";
		return (
			`${firstInitial}${lastInitial}` || this.email.charAt(0).toUpperCase()
		);
	}

	@belongsTo(() => School)
	declare school: BelongsTo<typeof School>;

	@belongsTo(() => Group)
	declare group: BelongsTo<typeof Group>;

	@hasMany(() => QuestSubmission)
	declare questSubmissions: HasMany<typeof QuestSubmission>;

	@hasMany(() => RewardRedemption)
	declare rewardRedemptions: HasMany<typeof RewardRedemption>;

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

	// Security helper methods
	isAccountLocked(): boolean {
		if (!this.lockedUntil) return false;
		return this.lockedUntil > DateTime.now();
	}

	async incrementFailedAttempts(): Promise<void> {
		this.failedLoginAttempts = (this.failedLoginAttempts || 0) + 1;

		// Lock account after 5 failed attempts for 30 minutes
		if (this.failedLoginAttempts >= 5) {
			this.lockedUntil = DateTime.now().plus({ minutes: 30 });
		}

		await this.save();
	}

	async resetFailedAttempts(): Promise<void> {
		this.failedLoginAttempts = 0;
		this.lockedUntil = null;
		await this.save();
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
		this.groupId = null;
		this.level = 1;
		this.points = 0;
		await this.save();
	}

	static accessTokens = DbAccessTokensProvider.forModel(User);
}
