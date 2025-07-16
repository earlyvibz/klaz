import { BaseSchema } from "@adonisjs/lucid/schema";

export default class extends BaseSchema {
	protected tableName = "schools";

	async up() {
		this.schema.createTable(this.tableName, (table) => {
			table.uuid("id").primary();
			table.string("name").notNullable();
			table.string("slug").notNullable().unique();
			table.string("address").nullable();
			table.timestamps(true);
		});
	}

	async down() {
		this.schema.dropTable(this.tableName);
	}
}
