import type { HttpContext } from "@adonisjs/core/http";
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
import School from "#models/school";
import User from "#models/user";

export default class Group extends BaseModel {
	@column({ isPrimary: true })
	declare id: string;

	@column()
	declare name: string;

	@column()
	declare schoolId: string;

	@belongsTo(() => School)
	declare school: BelongsTo<typeof School>;

	@hasMany(() => User)
	declare users: HasMany<typeof User>;

	@column.dateTime({ autoCreate: true })
	declare createdAt: DateTime;

	@column.dateTime({ autoCreate: true, autoUpdate: true })
	declare updatedAt: DateTime;

	@beforeCreate()
	public static async assignId(model: Group) {
		model.id = uuidv4();
	}
}
