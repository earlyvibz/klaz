import { BaseModelDto } from "@adocasts.com/dto/base";
import type { DateTime } from "luxon";
import RewardRedemptionDto from "#dtos/reward_redemption";
import SchoolDto from "#dtos/school";
import type Reward from "#models/reward";

export default class RewardDto extends BaseModelDto {
	declare id: string;
	declare title: string;
	declare description: string;
	declare cost: number;
	declare imageUrl: string;
	declare stock: number;
	declare schoolId: string;
	declare school: SchoolDto | null;
	declare redemptions: RewardRedemptionDto[];
	declare createdAt: DateTime;
	declare updatedAt: DateTime;

	constructor(reward?: Reward) {
		super();

		if (!reward) return;
		this.id = reward.id;
		this.title = reward.title;
		this.description = reward.description;
		this.cost = reward.cost;
		this.imageUrl = reward.imageUrl;
		this.stock = reward.stock;
		this.schoolId = reward.schoolId;
		this.school = reward.school && new SchoolDto(reward.school);
		this.redemptions = RewardRedemptionDto.fromArray(reward.redemptions);
		this.createdAt = reward.createdAt;
		this.updatedAt = reward.updatedAt;
	}
}
