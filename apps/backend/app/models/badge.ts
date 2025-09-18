import { BaseModel, beforeCreate, column, hasMany } from "@adonisjs/lucid/orm";
import type { HasMany } from "@adonisjs/lucid/types/relations";
import type { DateTime } from "luxon";
import { v4 as uuidv4 } from "uuid";
import UserBadge from "#models/user_badge";

export default class Badge extends BaseModel {
	@column({ isPrimary: true })
	declare id: string;

	@column()
	declare name: string;

	@column()
	declare description: string | null;

	@column()
	declare icon: string | null;

	@column()
	declare imageUrl: string | null;

	@column()
	declare color: string;

	@column()
	declare requiredLevel: number | null;

	@column()
	declare requiredQuests: number | null;

	@column()
	declare requiredPoints: number | null;

	@column()
	declare badgeType: "achievement" | "milestone" | "special";

	@column()
	declare isActive: boolean;

	@hasMany(() => UserBadge)
	declare userBadges: HasMany<typeof UserBadge>;

	@column.dateTime({ autoCreate: true })
	declare createdAt: DateTime;

	@column.dateTime({ autoCreate: true, autoUpdate: true })
	declare updatedAt: DateTime;

	@beforeCreate()
	public static async assignId(model: Badge) {
		model.id = uuidv4();
	}
}
