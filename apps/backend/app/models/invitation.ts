import {
	BaseModel,
	beforeCreate,
	belongsTo,
	column,
} from "@adonisjs/lucid/orm";
import type { BelongsTo } from "@adonisjs/lucid/types/relations";
import type { DateTime } from "luxon";
import { v4 as uuidv4 } from "uuid";
import School from "#models/school";
import User from "#models/user";

export default class Invitation extends BaseModel {
	static table = "invitations";

	@column({ isPrimary: true })
	declare id: string;

	@column()
	declare schoolEmail: string;

	@column()
	declare firstName: string | null;

	@column()
	declare lastName: string | null;

	@column()
	declare invitationCode: string;

	@column()
	declare schoolId: string;

	@column()
	declare userId: string | null;

	@column()
	declare isUsed: boolean;

	@column.dateTime({ autoCreate: true })
	declare createdAt: DateTime;

	@column.dateTime({ autoCreate: true, autoUpdate: true })
	declare updatedAt: DateTime;

	@belongsTo(() => School)
	declare school: BelongsTo<typeof School>;

	@belongsTo(() => User)
	declare user: BelongsTo<typeof User>;

	@beforeCreate()
	public static async assignId(model: Invitation) {
		model.id = uuidv4();
	}

	public isAvailable(): boolean {
		return !this.isUsed;
	}

	public async markAsUsed(userId: string): Promise<void> {
		this.isUsed = true;
		this.userId = userId;
		await this.save();
	}
}
