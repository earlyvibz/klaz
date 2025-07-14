import { BaseSchema } from "@adonisjs/lucid/schema";

export default class extends BaseSchema {
	protected tableName = "rewards";

	async up() {
		this.schema.createTable(this.tableName, (table) => {
			table.uuid("id").primary();
			table.string("name").notNullable();
			table.text("description").nullable();
			table.integer("cost").notNullable();
			table
				.uuid("school_id")
				.references("id")
				.inTable("schools")
				.onDelete("CASCADE");
			table.boolean("is_active").defaultTo(true);
			table.timestamps(true);
		});
	}

	async down() {
		this.schema.dropTable(this.tableName);
	}
}
