import { BaseSchema } from "@adonisjs/lucid/schema";

export default class extends BaseSchema {
	protected tableName = "rate_limits";

	async up() {
		this.schema.createTable(this.tableName, (table) => {
			table.string("key").primary();
			table.integer("points").defaultTo(0);
			table.timestamp("expire_time").nullable();
		});
	}

	async down() {
		this.schema.dropTable(this.tableName);
	}
}
