import { BaseSchema } from "@adonisjs/lucid/schema";

export default class extends BaseSchema {
	protected tableName = "notifications";

	async up() {
		this.schema.createTable(this.tableName, (table) => {
			table.uuid("id").primary();
			table
				.uuid("user_id")
				.notNullable()
				.references("id")
				.inTable("users")
				.onDelete("CASCADE");
			table
				.uuid("quest_id")
				.nullable()
				.references("id")
				.inTable("quests")
				.onDelete("CASCADE");
			table
				.uuid("quest_submission_id")
				.nullable()
				.references("id")
				.inTable("quest_submissions")
				.onDelete("CASCADE");
			table
				.enum("type", [
					"QUEST_APPROVED",
					"QUEST_REJECTED",
					"NEW_QUEST",
					"LEVEL_UP",
				])
				.notNullable();
			table.string("title").notNullable();
			table.text("message").notNullable();
			table.boolean("is_read").defaultTo(false);
			table.json("metadata").nullable();
			table.timestamps(true);

			table.index(["user_id", "is_read"]);
			table.index(["user_id", "created_at"]);
			table.index(["type"]);
		});
	}

	async down() {
		this.schema.dropTable(this.tableName);
	}
}
