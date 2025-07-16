import { defineConfig, transports } from "@adonisjs/mail";
import env from "#start/env";

const mailConfig = defineConfig({
	default: "resend",

	/**
	 * The mailers object can be used to configure multiple mailers
	 * each using a different transport or same transport with different
	 * options.
	 */
	mailers: {
		resend: transports.resend({
			key: env.get("RESEND_API_KEY", "test-key"),
			baseUrl: "https://api.resend.com",
		}),
	},
});

export default mailConfig;

declare module "@adonisjs/mail/types" {
	export interface MailersList extends InferMailers<typeof mailConfig> {}
}
