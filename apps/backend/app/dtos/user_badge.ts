import { BaseModelDto } from "@adocasts.com/dto/base";
import BadgeDto from "#dtos/badge";
import type UserBadge from "#models/user_badge";

export default class UserBadgeDto extends BaseModelDto {
	declare id: string;
	declare userId: string;
	declare badgeId: string;
	declare earnedAt: string;
	declare badge: BadgeDto | null;
	declare createdAt: string;
	declare updatedAt: string;

	constructor(userBadge?: UserBadge) {
		super();

		if (!userBadge) return;
		this.id = userBadge.id;
		this.userId = userBadge.userId;
		this.badgeId = userBadge.badgeId;
		this.earnedAt = userBadge.earnedAt.toISO()!;
		this.badge = userBadge.badge && new BadgeDto(userBadge.badge);
		this.createdAt = userBadge.createdAt.toISO()!;
		this.updatedAt = userBadge.updatedAt.toISO()!;
	}

	toJson() {
		return {
			id: this.id,
			userId: this.userId,
			badgeId: this.badgeId,
			earnedAt: this.earnedAt,
			badge: this.badge?.toJson(),
			createdAt: this.createdAt,
			updatedAt: this.updatedAt,
		};
	}
}
