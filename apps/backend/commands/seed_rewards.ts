import { BaseCommand } from "@adonisjs/core/ace";
import type { CommandOptions } from "@adonisjs/core/types/ace";

export default class SeedRewards extends BaseCommand {
	static commandName = "seed:rewards";
	static description = "";

	static options: CommandOptions = {};

	async run() {
		this.logger.info('Hello world from "SeedRewards"');
	}
}
