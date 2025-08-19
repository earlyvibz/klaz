import { BaseModelDto } from "@adocasts.com/dto/base";
import type { DateTime } from "luxon";
import GroupDto from "#dtos/group";
import QuestDto from "#dtos/quest";
import RewardDto from "#dtos/reward";
import UserDto from "#dtos/user";
import type School from "#models/school";

export default class SchoolDto extends BaseModelDto {
	declare id: string;
	declare name: string;
	declare slug: string;
	declare address: string | null;
	declare logoUrl: string | null;
	declare primaryColor: string;
	declare secondaryColor: string;
	declare description: string | null;
	declare websiteUrl: string | null;
	declare contactEmail: string | null;
	declare phone: string | null;
	declare groups: GroupDto[];
	declare users: UserDto[];
	declare quests: QuestDto[];
	declare rewards: RewardDto[];
	declare createdAt: DateTime;
	declare updatedAt: DateTime;

	constructor(school?: School) {
		super();

		if (!school) return;
		this.id = school.id;
		this.name = school.name;
		this.slug = school.slug;
		this.address = school.address;
		this.logoUrl = school.logoUrl;
		this.primaryColor = school.primaryColor;
		this.secondaryColor = school.secondaryColor;
		this.description = school.description;
		this.websiteUrl = school.websiteUrl;
		this.contactEmail = school.contactEmail;
		this.phone = school.phone;
		this.groups = GroupDto.fromArray(school.groups);
		this.users = UserDto.fromArray(school.users);
		this.quests = QuestDto.fromArray(school.quests);
		this.rewards = RewardDto.fromArray(school.rewards);
		this.createdAt = school.createdAt;
		this.updatedAt = school.updatedAt;
	}
}
