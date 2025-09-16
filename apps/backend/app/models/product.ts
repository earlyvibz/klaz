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

export default class Product extends BaseModel {
	@column({ isPrimary: true })
	declare id: string;

	@column()
	declare title: string;

	@column()
	declare description: string | null;

	@column()
	declare image: string | null;

	@column()
	declare pricePoints: number;

	@column()
	declare supply: number;

	@column()
	declare maxQuantityPerStudent: number | null;

	@column()
	declare schoolId: string;

	@column()
	declare isActive: boolean;

	@belongsTo(() => School)
	declare school: BelongsTo<typeof School>;

	@column.dateTime({ autoCreate: true })
	declare createdAt: DateTime;

	@column.dateTime({ autoCreate: true, autoUpdate: true })
	declare updatedAt: DateTime;

	@beforeCreate()
	public static async assignId(model: Product) {
		model.id = uuidv4();
	}
}
