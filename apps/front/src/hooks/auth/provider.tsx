import { createElement, useCallback, useEffect, useState } from "react";
import { tuyau } from "@/main";
import { AuthContextInstance } from "./context";
import type { User, UserRole } from "./types";

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	const isAuthenticated = !!user;

	const checkAuth = useCallback(async () => {
		try {
			const { data } = await tuyau.me.$get();
			if (data?.user) {
				setUser(data.user);
			}
		} catch (_error) {
			localStorage.removeItem("auth-token");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		const token = localStorage.getItem("auth-token");
		if (token) {
			checkAuth();
		} else {
			setLoading(false);
		}
	}, [checkAuth]);

	const login = async (email: string, password: string) => {
		const { data, error } = await tuyau.login.$post({ email, password });

		if (error?.value) {
			const message =
				"message" in error.value
					? error.value.message
					: error.value.errors[0]?.message || "Erreur de connexion";
			throw new Error(message);
		}

		if (data?.token && data?.user) {
			const tokenValue = data.token.token;
			if (tokenValue) {
				localStorage.setItem("auth-token", tokenValue);
				setUser(data.user);
			}
		}
	};

	const signup = async (
		email: string,
		invitationCode: string,
		password: string,
	) => {
		const { data, error } = await tuyau.signup.$post({
			email,
			invitationCode,
			password,
		});

		if (error?.value) {
			const message =
				"message" in error.value
					? error.value.message
					: error.value.errors[0]?.message || "Erreur d'inscription";
			throw new Error(message);
		}

		if (data?.token) {
			localStorage.setItem("auth-token", data.token);
			await checkAuth();
		}
	};

	const logout = async () => {
		try {
			await tuyau.logout.$delete();
		} catch (error) {
			console.error("Logout error:", error);
		} finally {
			localStorage.removeItem("auth-token");
			setUser(null);
			// Force redirect using window.location
			window.location.href = "/auth/login";
		}
	};

	// Role utilities
	const isStudent = useCallback(() => {
		return user?.role === "STUDENT";
	}, [user]);

	const isAdmin = useCallback(() => {
		return user?.role === "ADMIN";
	}, [user]);

	const isSuperAdmin = useCallback(() => {
		return user?.role === "SUPERADMIN";
	}, [user]);

	const hasRole = useCallback(
		(role: UserRole) => {
			return user?.role === role;
		},
		[user],
	);

	const hasAnyRole = useCallback(
		(roles: UserRole[]) => {
			return roles.some((role) => user?.role === role);
		},
		[user],
	);

	const isAdminOrAbove = useCallback(() => {
		return user?.role === "ADMIN" || user?.role === "SUPERADMIN";
	}, [user]);

	const value = {
		isAuthenticated,
		user,
		login,
		signup,
		logout,
		loading,
		isStudent,
		isAdmin,
		isSuperAdmin,
		hasRole,
		hasAnyRole,
		isAdminOrAbove,
	};

	return createElement(AuthContextInstance.Provider, { value }, children);
}
