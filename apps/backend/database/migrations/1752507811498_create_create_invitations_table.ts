import { BaseSchema } from "@adonisjs/lucid/schema";

export default class extends BaseSchema {
	protected tableName = "invitations";

	async up() {
		this.schema.createTable(this.tableName, (table) => {
			table.uuid("id").primary();
			table.string("school_email").notNullable();
			table.string("first_name").nullable();
			table.string("last_name").nullable();
			table.string("invitation_code").notNullable().unique();
			table
				.uuid("school_id")
				.references("id")
				.inTable("schools")
				.onDelete("CASCADE");
			table.uuid("group_id").nullable().references("id").inTable("groups");
			table.boolean("is_used").defaultTo(false);
			table.timestamp("expires_at").nullable();
			table.timestamps(true);
		});
	}

	async down() {
		this.schema.dropTable(this.tableName);
	}
}
