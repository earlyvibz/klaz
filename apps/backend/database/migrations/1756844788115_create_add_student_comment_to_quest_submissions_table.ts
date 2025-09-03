import { BaseSchema } from "@adonisjs/lucid/schema";

export default class extends BaseSchema {
	protected tableName = "quest_submissions";

	async up() {
		this.schema.alterTable(this.tableName, (table) => {
			table.text("student_comment").nullable();
		});
	}

	async down() {
		this.schema.alterTable(this.tableName, (table) => {
			table.dropColumn("student_comment");
		});
	}
}
