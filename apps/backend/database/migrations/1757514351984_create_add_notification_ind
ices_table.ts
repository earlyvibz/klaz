import { BaseSchema } from "@adonisjs/lucid/schema";

export default class extends BaseSchema {
	protected tableName = "notifications";

	async up() {
		this.schema.alterTable(this.tableName, (table) => {
			// Composite index for user + read status (most common query)
			table.index(["user_id", "is_read"], "notifications_user_read_idx");

			// Composite index for user + created_at (for pagination and ordering)
			table.index(["user_id", "created_at"], "notifications_user_created_idx");

			// Index for notification type filtering
			table.index(["type"], "notifications_type_idx");

			// Composite index for user + type (filtered queries)
			table.index(["user_id", "type"], "notifications_user_type_idx");

			// Index for created_at (for time-based queries and cleanup)
			table.index(["created_at"], "notifications_created_idx");

			// Composite index for efficient unread count queries
			table.index(
				["user_id", "is_read", "created_at"],
				"notifications_user_read_created_idx",
			);
		});
	}

	async down() {
		this.schema.alterTable(this.tableName, (table) => {
			table.dropIndex(["user_id", "is_read"], "notifications_user_read_idx");
			table.dropIndex(
				["user_id", "created_at"],
				"notifications_user_created_idx",
			);
			table.dropIndex(["type"], "notifications_type_idx");
			table.dropIndex(["user_id", "type"], "notifications_user_type_idx");
			table.dropIndex(["created_at"], "notifications_created_idx");
			table.dropIndex(
				["user_id", "is_read", "created_at"],
				"notifications_user_read_created_idx",
			);
		});
	}
}
