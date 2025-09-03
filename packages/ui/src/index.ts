export const greeting = (name: string) => `Hello, ${name}!`;

export const config = {
	appName: "Schooling App",
	version: "1.0.0",
};

export * as hooks from "./hooks";
// CSS importé séparément via @klaz/ui/styles/globals.css

// Export direct des composants UI
export * from "./components";
// Re-export utils
export * from "./utils";
