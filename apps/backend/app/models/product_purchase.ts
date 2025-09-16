import {
	BaseModel,
	beforeCreate,
	belongsTo,
	column,
} from "@adonisjs/lucid/orm";
import type { BelongsTo } from "@adonisjs/lucid/types/relations";
import type { DateTime } from "luxon";
import { v4 as uuidv4 } from "uuid";
import Product from "#models/product";
import User from "#models/user";

export default class ProductPurchase extends BaseModel {
	@column({ isPrimary: true })
	declare id: string;

	@column()
	declare userId: string;

	@column()
	declare productId: string;

	@column()
	declare quantity: number;

	@column()
	declare pricePointsPerUnit: number;

	@column()
	declare totalPoints: number;

	@column()
	declare status: "pending" | "claimed" | "cancelled";

	@column.dateTime()
	declare claimedAt: DateTime | null;

	@column()
	declare claimedById: string | null;

	@belongsTo(() => User)
	declare user: BelongsTo<typeof User>;

	@belongsTo(() => Product)
	declare product: BelongsTo<typeof Product>;

	@belongsTo(() => User, { foreignKey: "claimedById" })
	declare claimedBy: BelongsTo<typeof User>;

	@column.dateTime({ autoCreate: true })
	declare createdAt: DateTime;

	@column.dateTime({ autoCreate: true, autoUpdate: true })
	declare updatedAt: DateTime;

	@beforeCreate()
	public static async assignId(model: ProductPurchase) {
		model.id = uuidv4();
	}
}
