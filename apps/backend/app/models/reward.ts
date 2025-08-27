import {
	BaseModel,
	beforeCreate,
	belongsTo,
	column,
	hasMany,
} from "@adonisjs/lucid/orm";
import type { BelongsTo, HasMany } from "@adonisjs/lucid/types/relations";
import type { DateTime } from "luxon";
import { v4 as uuidv4 } from "uuid";
import RewardRedemption from "#models/reward_redemption";
import School from "#models/school";

export default class Reward extends BaseModel {
	@column({ isPrimary: true })
	declare id: string;

	@column()
	declare title: string;

	@column()
	declare description: string;

	@column()
	declare cost: number;

	@column()
	declare imageUrl: string;

	@column()
	declare stock: number;

	@column()
	declare schoolId: string;

	@belongsTo(() => School)
	declare school: BelongsTo<typeof School>;

	@hasMany(() => RewardRedemption)
	declare redemptions: HasMany<typeof RewardRedemption>;

	@column.dateTime({ autoCreate: true })
	declare createdAt: DateTime;

	@column.dateTime({ autoCreate: true, autoUpdate: true })
	declare updatedAt: DateTime;

	@beforeCreate()
	public static async assignId(model: Reward) {
		model.id = uuidv4();
	}
}
