import { BaseModelDto } from "@adocasts.com/dto/base";
import type { DateTime } from "luxon";
import GroupDto from "#dtos/group";
import QuestSubmissionDto from "#dtos/quest_submission";
import RewardRedemptionDto from "#dtos/reward_redemption";
import SchoolDto from "#dtos/school";
import type User from "#models/user";

export default class UserDto extends BaseModelDto {
	declare id: string;
	declare firstName: string | null;
	declare lastName: string | null;
	declare email: string;
	declare role: "STUDENT" | "ADMIN" | "SUPERADMIN";
	declare level: number;
	declare points: number;
	declare schoolId: string | null;
	declare groupId: string | null;
	declare isActive: boolean;
	declare resetPasswordExpires: string | null;
	declare lastLoginAt: string | null;
	declare failedLoginAttempts: number;
	declare emailVerified: boolean;
	declare createdAt: DateTime;
	declare updatedAt: string | null;
	declare school: SchoolDto | null;
	declare group: GroupDto | null;
	declare questSubmissions: QuestSubmissionDto[];
	declare rewardRedemptions: RewardRedemptionDto[];
	declare isStudent: boolean;
	declare isAdmin: boolean;
	declare isSuperAdmin: boolean;
	declare hasAdminRights: boolean;

	constructor(user?: User) {
		super();

		if (!user) return;
		this.id = user.id;
		this.firstName = user.firstName;
		this.lastName = user.lastName;
		this.email = user.email;
		this.role = user.role;
		this.level = user.level;
		this.points = user.points;
		this.schoolId = user.schoolId;
		this.groupId = user.groupId;
		this.isActive = user.isActive;
		this.isStudent = user.isStudent();
		this.isAdmin = user.isAdmin();
		this.isSuperAdmin = user.isSuperAdmin();
		this.hasAdminRights = user.hasAdminRights();
		this.emailVerified = user.emailVerified;
		this.school = user.school && new SchoolDto(user.school);
		this.group = user.group && new GroupDto(user.group);
		this.questSubmissions = QuestSubmissionDto.fromArray(user.questSubmissions);
		this.rewardRedemptions = RewardRedemptionDto.fromArray(
			user.rewardRedemptions,
		);
	}

	toJson() {
		return {
			id: this.id,
			firstName: this.firstName,
			lastName: this.lastName,
			email: this.email,
			role: this.role,
			level: this.level,
			points: this.points,
			schoolId: this.schoolId,
			groupId: this.groupId,
			isActive: this.isActive,
			resetPasswordExpires: this.resetPasswordExpires,
			lastLoginAt: this.lastLoginAt,
			failedLoginAttempts: this.failedLoginAttempts,
			emailVerified: this.emailVerified,
			createdAt: this.createdAt,
			updatedAt: this.updatedAt,
			school: this.school && this.school,
			group: this.group && this.group,
			questSubmissions: this.questSubmissions,
			rewardRedemptions: this.rewardRedemptions,
			isStudent: this.isStudent,
			isAdmin: this.isAdmin,
			isSuperAdmin: this.isSuperAdmin,
			hasAdminRights: this.hasAdminRights,
		};
	}
}
