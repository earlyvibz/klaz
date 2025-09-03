import {
	BaseModel,
	beforeCreate,
	belongsTo,
	column,
} from "@adonisjs/lucid/orm";
import type { BelongsTo } from "@adonisjs/lucid/types/relations";
import type { DateTime } from "luxon";
import { v4 as uuidv4 } from "uuid";
import Quest from "#models/quest";
import User from "#models/user";

export default class QuestSubmission extends BaseModel {
	@column({ isPrimary: true })
	declare id: string;

	@column()
	declare userId: string;

	@column()
	declare questId: string;

	@column()
	declare proofUrl: string;

	@column()
	declare status: "PENDING" | "APPROVED" | "REJECTED";

	@column()
	declare studentComment?: string;

	@column()
	declare feedback?: string;

	@column.dateTime()
	declare submittedAt: DateTime;

	@belongsTo(() => User)
	declare user: BelongsTo<typeof User>;

	@belongsTo(() => Quest)
	declare quest: BelongsTo<typeof Quest>;

	@column.dateTime({ autoCreate: true })
	declare createdAt: DateTime;

	@column.dateTime({ autoCreate: true, autoUpdate: true })
	declare updatedAt: DateTime;

	@beforeCreate()
	public static async assignId(model: QuestSubmission) {
		model.id = uuidv4();
	}
}
