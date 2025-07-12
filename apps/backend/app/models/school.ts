import { BaseModel, beforeCreate, column, hasMany } from "@adonisjs/lucid/orm";
import type { HasMany } from "@adonisjs/lucid/types/relations";
import type { DateTime } from "luxon";
import { v4 as uuidv4 } from "uuid";
import Group from "#models/group";
import Quest from "#models/quest";
import Reward from "#models/reward";
import User from "#models/user";

export default class School extends BaseModel {
	@column({ isPrimary: true })
	declare id: string;

	@column()
	declare name: string;

	@column()
	declare slug: string;

	@hasMany(() => Group)
	declare groups: HasMany<typeof Group>;

	@hasMany(() => User)
	declare users: HasMany<typeof User>;

	@hasMany(() => Quest)
	declare quests: HasMany<typeof Quest>;

	@hasMany(() => Reward)
	declare rewards: HasMany<typeof Reward>;

	@column.dateTime({ autoCreate: true })
	declare createdAt: DateTime;

	@column.dateTime({ autoCreate: true, autoUpdate: true })
	declare updatedAt: DateTime;

	@beforeCreate()
	public static async assignId(model: School) {
		model.id = uuidv4();
	}
}
