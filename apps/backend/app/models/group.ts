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

	// Méthodes helper tenant
	static forCurrentTenant() {
		return TenantController.scopeToTenant(Group.query());
	}

	static createForCurrentTenant(data: Partial<Group>) {
		const schoolId = TenantController.getCurrentSchoolId();
		if (schoolId && !data.schoolId) {
			data.schoolId = schoolId;
		}
		return Group.create(data);
	}
}
