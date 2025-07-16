import { createContext, useContext } from "react";
import type { AuthContext } from "./types";

const AuthContextInstance = createContext<AuthContext | null>(null);

export { AuthContextInstance };

export function useAuth() {
	const context = useContext(AuthContextInstance);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}
