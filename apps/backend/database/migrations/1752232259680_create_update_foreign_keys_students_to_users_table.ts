import { BaseSchema } from "@adonisjs/lucid/schema";

export default class extends BaseSchema {
	async up() {
		// Update quest_submissions table
		this.schema.alterTable("quest_submissions", (table) => {
			table.dropForeign(["student_id"]);
			table.renameColumn("student_id", "user_id");
			table
				.foreign("user_id")
				.references("id")
				.inTable("users")
				.onDelete("CASCADE");
		});

		// Update reward_redemptions table
		this.schema.alterTable("reward_redemptions", (table) => {
			table.dropForeign(["student_id"]);
			table.renameColumn("student_id", "user_id");
			table
				.foreign("user_id")
				.references("id")
				.inTable("users")
				.onDelete("CASCADE");
		});
	}

	async down() {
		// Rollback quest_submissions table
		this.schema.alterTable("quest_submissions", (table) => {
			table.dropForeign(["user_id"]);
			table.renameColumn("user_id", "student_id");
			table
				.foreign("student_id")
				.references("id")
				.inTable("students")
				.onDelete("CASCADE");
		});

		// Rollback reward_redemptions table
		this.schema.alterTable("reward_redemptions", (table) => {
			table.dropForeign(["user_id"]);
			table.renameColumn("user_id", "student_id");
			table
				.foreign("student_id")
				.references("id")
				.inTable("students")
				.onDelete("CASCADE");
		});
	}
}
