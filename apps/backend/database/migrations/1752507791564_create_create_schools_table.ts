import { BaseSchema } from "@adonisjs/lucid/schema";

export default class extends BaseSchema {
	protected tableName = "schools";

	async up() {
		this.schema.createTable(this.tableName, (table) => {
			table.uuid("id").primary();
			table.string("name").notNullable();
			table.string("slug").notNullable().unique();
			table.string("address").nullable();

			// Champs de personnalisation
			table.string("logo_url").nullable();
			table.string("primary_color").nullable().defaultTo("#3B82F6");
			table.string("secondary_color").nullable().defaultTo("#64748B");
			table.text("description").nullable();
			table.string("website_url").nullable();
			table.string("contact_email").nullable();
			table.string("phone").nullable();

			table.timestamps(true);
		});
	}

	async down() {
		this.schema.dropTable(this.tableName);
	}
}
