import { BaseModel, beforeCreate, column, hasMany } from "@adonisjs/lucid/orm";
import type { HasMany } from "@adonisjs/lucid/types/relations";
import type { DateTime } from "luxon";
import { v4 as uuidv4 } from "uuid";
import Invitation from "#models/invitation";
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

	@column()
	declare address: string | null;

	// Nouveaux champs de personnalisation
	@column()
	declare logoUrl: string | null;

	@column()
	declare primaryColor: string;

	@column()
	declare secondaryColor: string;

	@column()
	declare description: string | null;

	@column()
	declare websiteUrl: string | null;

	@column()
	declare contactEmail: string | null;

	@column()
	declare phone: string | null;

	@hasMany(() => User)
	declare users: HasMany<typeof User>;

	@hasMany(() => Quest)
	declare quests: HasMany<typeof Quest>;

	@hasMany(() => Reward)
	declare rewards: HasMany<typeof Reward>;

	@hasMany(() => Invitation)
	declare invitations: HasMany<typeof Invitation>;

	@column.dateTime({ autoCreate: true })
	declare createdAt: DateTime;

	@column.dateTime({ autoCreate: true, autoUpdate: true })
	declare updatedAt: DateTime;

	@beforeCreate()
	public static async assignId(model: School) {
		model.id = uuidv4();
	}
}
