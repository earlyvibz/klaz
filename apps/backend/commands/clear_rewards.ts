import { BaseCommand } from "@adonisjs/core/ace";
import type { CommandOptions } from "@adonisjs/core/types/ace";

export default class ClearRewards extends BaseCommand {
	static commandName = "clear:rewards";
	static description = "";

	static options: CommandOptions = {};

	async run() {
		this.logger.info('Hello world from "ClearRewards"');
	}
}
