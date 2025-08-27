import { BaseSchema } from "@adonisjs/lucid/schema";

export default class extends BaseSchema {
	protected tableName = "quests";

	async up() {
		this.schema.alterTable(this.tableName, (table) => {
			table.string("type").nullable();
			table.timestamp("deadline").nullable();
			table.enum("validation_type", ["MANUAL", "AUTO_API"]).defaultTo("MANUAL");
		});
	}

	async down() {
		this.schema.alterTable(this.tableName, (table) => {
			table.dropColumn("type");
			table.dropColumn("deadline");
			table.dropColumn("validation_type");
		});
	}
}
