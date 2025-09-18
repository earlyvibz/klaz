import { BaseModelDto } from "@adocasts.com/dto/base";
import type Badge from "#models/badge";

export default class BadgeDto extends BaseModelDto {
	declare id: string;
	declare name: string;
	declare description: string | null;
	declare icon: string | null;
	declare imageUrl: string | null;
	declare color: string;
	declare requiredLevel: number | null;
	declare requiredQuests: number | null;
	declare requiredPoints: number | null;
	declare badgeType: "achievement" | "milestone" | "special";
	declare isActive: boolean;
	declare createdAt: string;
	declare updatedAt: string;

	constructor(badge?: Badge) {
		super();

		if (!badge) return;
		this.id = badge.id;
		this.name = badge.name;
		this.description = badge.description;
		this.icon = badge.icon;
		this.imageUrl = badge.imageUrl;
		this.color = badge.color;
		this.requiredLevel = badge.requiredLevel;
		this.requiredQuests = badge.requiredQuests;
		this.requiredPoints = badge.requiredPoints;
		this.badgeType = badge.badgeType;
		this.isActive = badge.isActive;
		this.createdAt = badge.createdAt.toISO()!;
		this.updatedAt = badge.updatedAt.toISO()!;
	}

	toJson() {
		return {
			id: this.id,
			name: this.name,
			description: this.description,
			icon: this.icon,
			imageUrl: this.imageUrl,
			color: this.color,
			requiredLevel: this.requiredLevel,
			requiredQuests: this.requiredQuests,
			requiredPoints: this.requiredPoints,
			badgeType: this.badgeType,
			isActive: this.isActive,
			createdAt: this.createdAt,
			updatedAt: this.updatedAt,
		};
	}
}
