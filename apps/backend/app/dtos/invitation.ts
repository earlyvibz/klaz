import { BaseModelDto } from "@adocasts.com/dto/base";
import type { DateTime } from "luxon";
import SchoolDto from "#dtos/school";
import UserDto from "#dtos/user";
import type Invitation from "#models/invitation";

export default class InvitationDto extends BaseModelDto {
	declare id: string;
	declare schoolEmail: string;
	declare firstName: string | null;
	declare lastName: string | null;
	declare invitationCode: string;
	declare schoolId: string;
	declare userId: string | null;
	declare isUsed: boolean;
	declare createdAt: DateTime;
	declare updatedAt: DateTime;
	declare school: SchoolDto | null;
	declare user: UserDto | null;
	declare isAvailable: boolean;

	constructor(invitation?: Invitation) {
		super();

		if (!invitation) return;
		this.id = invitation.id;
		this.schoolEmail = invitation.schoolEmail;
		this.firstName = invitation.firstName;
		this.lastName = invitation.lastName;
		this.invitationCode = invitation.invitationCode;
		this.schoolId = invitation.schoolId;
		this.userId = invitation.userId;
		this.isUsed = invitation.isUsed;
		this.createdAt = invitation.createdAt;
		this.updatedAt = invitation.updatedAt;
		this.school = invitation.school && new SchoolDto(invitation.school);
		this.user = invitation.user && new UserDto(invitation.user);
		this.isAvailable = invitation.isAvailable();
	}
}
