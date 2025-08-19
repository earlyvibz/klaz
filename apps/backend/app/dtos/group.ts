import { BaseModelDto } from "@adocasts.com/dto/base";
import type { DateTime } from "luxon";
import SchoolDto from "#dtos/school";
import UserDto from "#dtos/user";
import type Group from "#models/group";

export default class GroupDto extends BaseModelDto {
	declare id: string;
	declare name: string;
	declare schoolId: string;
	declare school: SchoolDto | null;
	declare users: UserDto[];
	declare createdAt: DateTime;
	declare updatedAt: DateTime;

	constructor(group?: Group) {
		super();

		if (!group) return;
		this.id = group.id;
		this.name = group.name;
		this.schoolId = group.schoolId;
		this.school = group.school && new SchoolDto(group.school);
		this.users = UserDto.fromArray(group.users);
		this.createdAt = group.createdAt;
		this.updatedAt = group.updatedAt;
	}
}
