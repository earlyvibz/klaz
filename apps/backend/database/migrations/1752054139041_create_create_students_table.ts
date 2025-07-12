import { BaseSchema } from "@adonisjs/lucid/schema";

export default class extends BaseSchema {
	protected tableName = "students";

	async up() {
		this.schema.createTable(this.tableName, (table) => {
			table.uuid("id").primary();
			table.string("full_name").nullable();
			table.string("email", 254).notNullable().unique();
			table.string("password").notNullable();
			table.integer("points").defaultTo(0);
			table.integer("level").defaultTo(1);
			table
				.uuid("school_id")
				.references("id")
				.inTable("schools")
				.onDelete("CASCADE");
			table.uuid("group_id").nullable().references("id").inTable("groups");
			table.timestamps(true);
		});
	}

	async down() {
		this.schema.dropTable(this.tableName);
	}
}
