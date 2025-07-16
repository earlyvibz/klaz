import { BaseSchema } from "@adonisjs/lucid/schema";

export default class extends BaseSchema {
	protected tableName = "invitations";

	async up() {
		this.schema.alterTable(this.tableName, (table) => {
			table
				.uuid("user_id")
				.nullable()
				.references("id")
				.inTable("users")
				.onDelete("SET NULL");
		});
	}

	async down() {
		this.schema.alterTable(this.tableName, (table) => {
			table.dropColumn("user_id");
		});
	}
}
