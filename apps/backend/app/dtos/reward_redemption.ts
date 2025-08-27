import { BaseModelDto } from "@adocasts.com/dto/base";
import type { DateTime } from "luxon";
import RewardDto from "#dtos/reward";
import UserDto from "#dtos/user";
import type RewardRedemption from "#models/reward_redemption";

export default class RewardRedemptionDto extends BaseModelDto {
	declare id: string;
	declare rewardId: string;
	declare userId: string;
	declare status: "PENDING" | "VALIDATED" | "CANCELED";
	declare redeemedAt: DateTime;
	declare reward: RewardDto | null;
	declare user: UserDto | null;
	declare createdAt: DateTime;
	declare updatedAt: DateTime;

	constructor(rewardRedemption?: RewardRedemption) {
		super();

		if (!rewardRedemption) return;
		this.id = rewardRedemption.id;
		this.rewardId = rewardRedemption.rewardId;
		this.userId = rewardRedemption.userId;
		this.status = rewardRedemption.status;
		this.redeemedAt = rewardRedemption.redeemedAt;
		this.reward =
			rewardRedemption.reward && new RewardDto(rewardRedemption.reward);
		this.user = rewardRedemption.user && new UserDto(rewardRedemption.user);
		this.createdAt = rewardRedemption.createdAt;
		this.updatedAt = rewardRedemption.updatedAt;
	}
}
