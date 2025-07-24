import {
	BaseModel,
	beforeCreate,
	belongsTo,
	column,
} from "@adonisjs/lucid/orm";
import type { BelongsTo } from "@adonisjs/lucid/types/relations";
import { DateTime } from "luxon";
import { v4 as uuidv4 } from "uuid";
import TenantController from "#controllers/tenant_controller";
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
	declare firstName: string | null;

	@column()
	declare lastName: string | null;

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
	declare expiresAt: DateTime | null;

	@column.dateTime({ autoCreate: true })
	declare createdAt: DateTime;

	@column.dateTime({ autoCreate: true, autoUpdate: true })
	declare updatedAt: DateTime;

	get displayName(): string {
		if (this.firstName && this.lastName) {
			return `${this.firstName} ${this.lastName}`;
		}
		return this.firstName || this.lastName || this.schoolEmail;
	}

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

	public async markAsUsed(): Promise<void> {
		this.isUsed = true;
		await this.save();
	}

	// Méthodes helper tenant
	static forCurrentTenant() {
		return TenantController.scopeToTenant(Invitation.query());
	}

	static createForCurrentTenant(data: Partial<Invitation>) {
		const schoolId = TenantController.getCurrentSchoolId();
		if (schoolId && !data.schoolId) {
			data.schoolId = schoolId;
		}
		return Invitation.create(data);
	}
}
