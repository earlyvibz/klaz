import { BaseSchema } from "@adonisjs/lucid/schema";

export default class extends BaseSchema {
	protected tableName = "quest_submissions";

	async up() {
		this.schema.alterTable(this.tableName, (table) => {
			table.dropColumn("content");
			table.string("proof_url").nullable();
			table.timestamp("submitted_at").nullable();
		});
	}

	async down() {
		this.schema.alterTable(this.tableName, (table) => {
			table.text("content").nullable();
			table.dropColumn("proof_url");
			table.dropColumn("submitted_at");
		});
	}
}
