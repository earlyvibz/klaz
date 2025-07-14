import { BaseSchema } from "@adonisjs/lucid/schema";

export default class extends BaseSchema {
	protected tableName = "invitations";

	async up() {
		this.schema.createTable(this.tableName, (table) => {
			table.uuid("id").primary();
			table.string("school_email", 254).notNullable(); // Email du CSV
			table.string("full_name").nullable();
			table.string("invitation_code").notNullable().unique();
			table
				.uuid("school_id")
				.references("id")
				.inTable("schools")
				.onDelete("CASCADE");
			table.uuid("group_id").nullable().references("id").inTable("groups");
			table
				.uuid("user_id")
				.nullable()
				.references("id")
				.inTable("users")
				.onDelete("SET NULL"); // Utilisateur créé
			table.boolean("is_used").defaultTo(false);
			table.timestamp("used_at").nullable();
			table.timestamp("expires_at").nullable();
			table.timestamp("created_at");
			table.timestamp("updated_at");
		});
	}

	async down() {
		this.schema.dropTable(this.tableName);
	}
}
