import {
	BaseModel,
	beforeCreate,
	belongsTo,
	column,
} from "@adonisjs/lucid/orm";
import type { BelongsTo } from "@adonisjs/lucid/types/relations";
import type { DateTime } from "luxon";
import { v4 as uuidv4 } from "uuid";
import Reward from "#models/reward";
import User from "#models/user";

export default class RewardRedemption extends BaseModel {
	@column({ isPrimary: true })
	declare id: string;

	@column()
	declare rewardId: string;

	@column()
	declare userId: string;

	@column()
	declare status: "PENDING" | "VALIDATED" | "CANCELED";

	@column.dateTime()
	declare redeemedAt: DateTime;

	@belongsTo(() => Reward)
	declare reward: BelongsTo<typeof Reward>;

	@belongsTo(() => User)
	declare user: BelongsTo<typeof User>;

	@column.dateTime({ autoCreate: true })
	declare createdAt: DateTime;

	@column.dateTime({ autoCreate: true, autoUpdate: true })
	declare updatedAt: DateTime;

	@beforeCreate()
	public static async assignId(model: RewardRedemption) {
		model.id = uuidv4();
	}
}
