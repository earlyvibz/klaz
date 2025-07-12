import { BaseSchema } from "@adonisjs/lucid/schema";

export default class extends BaseSchema {
	protected tableName = "students";

	async up() {
		this.schema.alterTable(this.tableName, (table) => {
			table.string("invitation_code").notNullable();
			table.boolean("is_active").defaultTo(true);
		});
	}

	async down() {
		this.schema.alterTable(this.tableName, (table) => {
			table.dropColumn("invitation_code");
			table.dropColumn("is_active");
		});
	}
}
