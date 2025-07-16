import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [react(), tsconfigPaths()],
	test: {
		environment: "jsdom",
		setupFiles: ["./tests/setup.ts"],
		include: ["./tests/units/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
		exclude: ["./tests/e2e/**/*"],
		globals: true,
	},
});
