import { BaseSchema } from "@adonisjs/lucid/schema";

export default class extends BaseSchema {
	protected tableName = "users";

	async up() {
		this.schema.createTable(this.tableName, (table) => {
			table.uuid("id").primary();
			table.string("first_name").nullable();
			table.string("last_name").nullable();
			table.string("email", 254).notNullable().unique();
			table.string("password").notNullable();
			table
				.enum("role", ["STUDENT", "ADMIN", "SUPERADMIN"])
				.defaultTo("STUDENT");
			table.integer("level").defaultTo(1);
			table.integer("points").defaultTo(0);
			table
				.uuid("school_id")
				.references("id")
				.inTable("schools")
				.onDelete("CASCADE");
			table.uuid("group_id").nullable().references("id").inTable("groups");
			table.boolean("is_active").defaultTo(true);
			table.string("reset_password_token").nullable();
			table.timestamp("reset_password_expires").nullable();
			table.timestamp("last_login_at").nullable();
			table.integer("failed_login_attempts").defaultTo(0);
			table.boolean("email_verified").defaultTo(false);
			table.string("email_verification_token").nullable();
			table.timestamps(true);
		});
	}

	async down() {
		this.schema.dropTable(this.tableName);
	}
}
