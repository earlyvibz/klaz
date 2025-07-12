import { BaseSchema } from "@adonisjs/lucid/schema";

export default class extends BaseSchema {
	protected tableName = "quest_submissions";

	async up() {
		this.schema.createTable(this.tableName, (table) => {
			table.uuid("id").primary();
			table
				.uuid("student_id")
				.references("id")
				.inTable("students")
				.onDelete("CASCADE");
			table
				.uuid("quest_id")
				.references("id")
				.inTable("quests")
				.onDelete("CASCADE");
			table.text("proof_url").nullable();
			table
				.enum("status", ["PENDING", "APPROVED", "REJECTED"])
				.defaultTo("PENDING");
			table.timestamp("submitted_at", { useTz: true }).defaultTo(this.now());
			table.timestamps(true);
		});
	}

	async down() {
		this.schema.dropTable(this.tableName);
	}
}
