import { BaseCommand } from "@adonisjs/core/ace";
import type { CommandOptions } from "@adonisjs/core/types/ace";
import Notification from "#models/notification";

export default class ClearNotifications extends BaseCommand {
	static commandName = "clear:notifications";
	static description = "Clear all notifications from the database";

	static options: CommandOptions = {
		startApp: true,
	};

	async run() {
		const confirm = await this.prompt.confirm(
			"Are you sure you want to delete ALL notifications?",
		);

		if (!confirm) {
			this.logger.info("Operation cancelled");
			return;
		}

		this.logger.info("Clearing all notifications...");

		const deletedCount = await Notification.query().delete();

		this.logger.success(`✅ Deleted ${deletedCount} notifications`);
	}
}
