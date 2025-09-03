import { defineConfig, services } from "@adonisjs/drive";
import env from "#start/env";

const driveConfig = defineConfig({
	default: "r2",

	/**
	 * The services object can be used to configure multiple file system
	 * services each using the same or a different driver.
	 */
	services: {
		r2: services.s3({
			credentials: {
				accessKeyId: env.get("R2_KEY") || "",
				secretAccessKey: env.get("R2_SECRET") || "",
			},
			region: "auto",
			bucket: env.get("R2_BUCKET") || "",
			endpoint: env.get("R2_ENDPOINT") || "",
			visibility: "public",
			cdnUrl: env.get("R2_CDN_URL") || "",
		}),
	},
});

export default driveConfig;

declare module "@adonisjs/drive/types" {
	export interface DriveDisks extends InferDriveDisks<typeof driveConfig> {}
}
