import {
	BaseModel,
	beforeCreate,
	belongsTo,
	column,
} from "@adonisjs/lucid/orm";
import type { BelongsTo } from "@adonisjs/lucid/types/relations";
import { DateTime } from "luxon";
import { v4 as uuidv4 } from "uuid";
import Group from "#models/group";
import School from "#models/school";
import User from "#models/user";

export default class Invitation extends BaseModel {
	static table = "invitations";

	@column({ isPrimary: true })
	declare id: string;

	@column()
	declare schoolEmail: string;

	@column()
	declare fullName: string | null;

	@column()
	declare invitationCode: string;

	@column()
	declare schoolId: string;

	@column()
	declare groupId: string | null;

	@column()
	declare userId: string | null;

	@column()
	declare isUsed: boolean;

	@column.dateTime()
	declare usedAt: DateTime | null;

	@column.dateTime()
	declare expiresAt: DateTime | null;

	@column.dateTime({ autoCreate: true })
	declare createdAt: DateTime;

	@column.dateTime({ autoCreate: true, autoUpdate: true })
	declare updatedAt: DateTime;

	@belongsTo(() => School)
	declare school: BelongsTo<typeof School>;

	@belongsTo(() => Group)
	declare group: BelongsTo<typeof Group>;

	@belongsTo(() => User)
	declare user: BelongsTo<typeof User>;

	@beforeCreate()
	public static async assignId(model: Invitation) {
		model.id = uuidv4();
	}

	public isExpired(): boolean {
		return this.expiresAt ? this.expiresAt < DateTime.now() : false;
	}

	public isAvailable(): boolean {
		return !this.isUsed && !this.isExpired();
	}

	public async markAsUsed(userId: string): Promise<void> {
		this.isUsed = true;
		this.userId = userId;
		this.usedAt = DateTime.now();
		await this.save();
	}
}
