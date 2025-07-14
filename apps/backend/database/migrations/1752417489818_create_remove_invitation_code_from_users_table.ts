import { BaseSchema } from "@adonisjs/lucid/schema";

export default class extends BaseSchema {
	protected tableName = "users";

	async up() {
		this.schema.alterTable(this.tableName, (table) => {
			table.dropColumn("invitation_code");
		});
	}

	async down() {
		this.schema.alterTable(this.tableName, (table) => {
			table.string("invitation_code").notNullable().defaultTo("");
		});
	}
}
