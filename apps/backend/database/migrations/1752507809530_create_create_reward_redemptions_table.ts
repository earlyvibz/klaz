import { BaseSchema } from "@adonisjs/lucid/schema";

export default class extends BaseSchema {
	protected tableName = "reward_redemptions";

	async up() {
		this.schema.createTable(this.tableName, (table) => {
			table.uuid("id").primary();
			table
				.uuid("user_id")
				.references("id")
				.inTable("users")
				.onDelete("CASCADE");
			table
				.uuid("reward_id")
				.references("id")
				.inTable("rewards")
				.onDelete("CASCADE");
			table.integer("points_spent").notNullable();
			table
				.enum("status", ["PENDING", "FULFILLED", "CANCELLED"])
				.defaultTo("PENDING");
			table.timestamps(true);
		});
	}

	async down() {
		this.schema.dropTable(this.tableName);
	}
}
