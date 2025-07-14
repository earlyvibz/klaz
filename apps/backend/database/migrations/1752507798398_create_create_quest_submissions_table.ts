import { BaseSchema } from "@adonisjs/lucid/schema";

export default class extends BaseSchema {
	protected tableName = "quest_submissions";

	async up() {
		this.schema.createTable(this.tableName, (table) => {
			table.uuid("id").primary();
			table
				.uuid("user_id")
				.references("id")
				.inTable("users")
				.onDelete("CASCADE");
			table
				.uuid("quest_id")
				.references("id")
				.inTable("quests")
				.onDelete("CASCADE");
			table.text("content").nullable();
			table
				.enum("status", ["PENDING", "APPROVED", "REJECTED"])
				.defaultTo("PENDING");
			table.text("feedback").nullable();
			table.timestamps(true);

			table.unique(["user_id", "quest_id"]);
		});
	}

	async down() {
		this.schema.dropTable(this.tableName);
	}
}
