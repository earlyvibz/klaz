import { BaseSchema } from "@adonisjs/lucid/schema";

export default class extends BaseSchema {
	protected tableName = "reward_redemptions";

	async up() {
		this.schema.createTable(this.tableName, (table) => {
			table.uuid("id").primary();
			table
				.uuid("student_id")
				.references("id")
				.inTable("students")
				.onDelete("CASCADE");
			table
				.uuid("reward_id")
				.references("id")
				.inTable("rewards")
				.onDelete("CASCADE");
			table
				.enum("status", ["PENDING", "VALIDATED", "CANCELED"])
				.defaultTo("PENDING");
			table.timestamp("redeemed_at", { useTz: true }).defaultTo(this.now());
			table.timestamps(true);
		});
	}

	async down() {
		this.schema.dropTable(this.tableName);
	}
}
