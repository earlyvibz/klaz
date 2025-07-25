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
import TenantController from "#controllers/tenant_controller";
import QuestSubmission from "#models/quest_submission";
import School from "#models/school";

export default class Quest extends BaseModel {
	@column({ isPrimary: true })
	declare id: string;

	@column()
	declare title: string;

	@column()
	declare description: string;

	@column()
	declare type: string; // ex: 'UGC', 'SOCIAL', 'EVENT'

	@column()
	declare points: number;

	@column.dateTime({ autoCreate: false })
	declare deadline?: DateTime;

	@column()
	declare validationType: "MANUAL" | "AUTO_API";

	@column()
	declare schoolId: string;

	@belongsTo(() => School)
	declare school: BelongsTo<typeof School>;

	@hasMany(() => QuestSubmission)
	declare submissions: HasMany<typeof QuestSubmission>;

	@column.dateTime({ autoCreate: true })
	declare createdAt: DateTime;

	@column.dateTime({ autoCreate: true, autoUpdate: true })
	declare updatedAt: DateTime;

	@beforeCreate()
	public static async assignId(model: Quest) {
		model.id = uuidv4();
	}

	// Méthodes helper tenant
	static forCurrentTenant() {
		return TenantController.scopeToTenant(Quest.query());
	}

	static createForCurrentTenant(data: Partial<Quest>) {
		const schoolId = TenantController.getCurrentSchoolId();
		if (schoolId && !data.schoolId) {
			data.schoolId = schoolId;
		}
		return Quest.create(data);
	}
}
