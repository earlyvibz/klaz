import { BaseSchema } from "@adonisjs/lucid/schema";

export default class extends BaseSchema {
	protected tableName = "quests";

	async up() {
		this.schema.createTable(this.tableName, (table) => {
			table.uuid("id").primary();
			table.string("title").notNullable();
			table.text("description");
			table.string("type").notNullable();
			table.integer("points").notNullable();
			table.timestamp("deadline", { useTz: true }).nullable();
			table.enum("validation_type", ["MANUAL", "AUTO_API"]).notNullable();
			table
				.uuid("school_id")
				.references("id")
				.inTable("schools")
				.onDelete("CASCADE");
			table.timestamps(true);
		});
	}

	async down() {
		this.schema.dropTable(this.tableName);
	}
}
