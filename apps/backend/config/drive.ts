import { defineConfig, services } from "@adonisjs/drive";
import env from "#start/env";

const driveConfig = defineConfig({
	default: env.get("DRIVE_DISK"),

	/**
	 * The services object can be used to configure multiple file system
	 * services each using the same or a different driver.
	 */
	services: {
		local: services.fs({
			location: new URL("../tmp/uploads/", import.meta.url),
			serveFiles: true,
			routeBasePath: "/uploads",
			visibility: "public",
		}),
		r2: services.s3({
			credentials: {
				accessKeyId: env.get("R2_KEY") || "dummy",
				secretAccessKey: env.get("R2_SECRET") || "dummy",
			},
			region: "auto",
			bucket: env.get("R2_BUCKET") || "dummy",
			endpoint: env.get("R2_ENDPOINT") || "https://dummy.com",
			visibility: "public",
		}),
	},
});

export default driveConfig;

declare module "@adonisjs/drive/types" {
	export interface DriveDisks extends InferDriveDisks<typeof driveConfig> {}
}
