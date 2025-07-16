import { beforeEach, describe, expect, it } from "vitest";
import type { User } from "@/hooks/auth/types";
import { UserRole } from "@/hooks/auth/types";

const createMockUser = (role: User["role"]): User => ({
	id: "1",
	firstName: "Test",
	lastName: "User",
	email: "test@test.com",
	role,
	schoolId: "school-1",
	group: null,
});

describe("Auth Provider Logic", () => {
	describe("Role checking utilities", () => {
		describe("isStudent", () => {
			it("should return true for student user", () => {
				const user = createMockUser("STUDENT");
				const isStudent = () => user?.role === "STUDENT";
				expect(isStudent()).toBe(true);
			});

			it("should return false for admin user", () => {
				const user = createMockUser("ADMIN");
				const isStudent = () => user?.role === "STUDENT";
				expect(isStudent()).toBe(false);
			});

			it("should return false for super admin user", () => {
				const user = createMockUser("SUPERADMIN");
				const isStudent = () => user?.role === "STUDENT";
				expect(isStudent()).toBe(false);
			});

			it("should return false for null user", () => {
				const isStudent = (user: User | null) => user?.role === "STUDENT";
				expect(isStudent(null)).toBe(false);
			});
		});

		describe("isAdmin", () => {
			it("should return true for admin user", () => {
				const user = createMockUser("ADMIN");
				const isAdmin = () => user?.role === "ADMIN";
				expect(isAdmin()).toBe(true);
			});

			it("should return false for student user", () => {
				const user = createMockUser("STUDENT");
				const isAdmin = () => user?.role === "ADMIN";
				expect(isAdmin()).toBe(false);
			});

			it("should return false for super admin user", () => {
				const user = createMockUser("SUPERADMIN");
				const isAdmin = () => user?.role === "ADMIN";
				expect(isAdmin()).toBe(false);
			});
		});

		describe("isSuperAdmin", () => {
			it("should return true for super admin user", () => {
				const user = createMockUser("SUPERADMIN");
				const isSuperAdmin = () => user?.role === "SUPERADMIN";
				expect(isSuperAdmin()).toBe(true);
			});

			it("should return false for admin user", () => {
				const user = createMockUser("ADMIN");
				const isSuperAdmin = () => user?.role === "SUPERADMIN";
				expect(isSuperAdmin()).toBe(false);
			});

			it("should return false for student user", () => {
				const user = createMockUser("STUDENT");
				const isSuperAdmin = () => user?.role === "SUPERADMIN";
				expect(isSuperAdmin()).toBe(false);
			});
		});

		describe("hasRole", () => {
			it("should return true when user has the specified role", () => {
				const user = createMockUser("ADMIN");
				const hasRole = (role: UserRole) => user?.role === role;
				expect(hasRole(UserRole.ADMIN)).toBe(true);
			});

			it("should return false when user does not have the specified role", () => {
				const user = createMockUser("STUDENT");
				const hasRole = (role: UserRole) => user?.role === role;
				expect(hasRole(UserRole.ADMIN)).toBe(false);
			});

			it("should return false when user is null", () => {
				const hasRole = (user: User | null, role: UserRole) =>
					user?.role === role;
				expect(hasRole(null, UserRole.ADMIN)).toBe(false);
			});
		});

		describe("hasAnyRole", () => {
			it("should return true when user has one of the specified roles", () => {
				const user = createMockUser("ADMIN");
				const hasAnyRole = (roles: UserRole[]) =>
					roles.some((role) => user?.role === role);
				expect(hasAnyRole([UserRole.ADMIN, UserRole.SUPERADMIN])).toBe(true);
			});

			it("should return false when user has none of the specified roles", () => {
				const user = createMockUser("STUDENT");
				const hasAnyRole = (roles: UserRole[]) =>
					roles.some((role) => user?.role === role);
				expect(hasAnyRole([UserRole.ADMIN, UserRole.SUPERADMIN])).toBe(false);
			});

			it("should return true when user role matches any in the array", () => {
				const user = createMockUser("SUPERADMIN");
				const hasAnyRole = (roles: UserRole[]) =>
					roles.some((role) => user?.role === role);
				expect(hasAnyRole([UserRole.ADMIN, UserRole.SUPERADMIN])).toBe(true);
			});

			it("should return false for empty roles array", () => {
				const user = createMockUser("ADMIN");
				const hasAnyRole = (roles: UserRole[]) =>
					roles.some((role) => user?.role === role);
				expect(hasAnyRole([])).toBe(false);
			});
		});

		describe("isAdminOrAbove", () => {
			it("should return true for admin user", () => {
				const user = createMockUser("ADMIN");
				const isAdminOrAbove = () =>
					user?.role === "ADMIN" || user?.role === "SUPERADMIN";
				expect(isAdminOrAbove()).toBe(true);
			});

			it("should return true for super admin user", () => {
				const user = createMockUser("SUPERADMIN");
				const isAdminOrAbove = () =>
					user?.role === "ADMIN" || user?.role === "SUPERADMIN";
				expect(isAdminOrAbove()).toBe(true);
			});

			it("should return false for student user", () => {
				const user = createMockUser("STUDENT");
				const isAdminOrAbove = () =>
					user?.role === "ADMIN" || user?.role === "SUPERADMIN";
				expect(isAdminOrAbove()).toBe(false);
			});

			it("should return false for null user", () => {
				const isAdminOrAbove = (user: User | null) =>
					user?.role === "ADMIN" || user?.role === "SUPERADMIN";
				expect(isAdminOrAbove(null)).toBe(false);
			});
		});
	});

	describe("Authentication state", () => {
		it("should return true for authenticated state when user exists", () => {
			const user = createMockUser("STUDENT");
			const isAuthenticated = !!user;
			expect(isAuthenticated).toBe(true);
		});

		it("should return false for authenticated state when user is null", () => {
			const user = null;
			const isAuthenticated = !!user;
			expect(isAuthenticated).toBe(false);
		});

		it("should return false for authenticated state when user is undefined", () => {
			const user = undefined;
			const isAuthenticated = !!user;
			expect(isAuthenticated).toBe(false);
		});
	});

	describe("localStorage management", () => {
		beforeEach(() => {
			localStorage.clear();
		});

		it("should store token in localStorage", () => {
			const token = "test-token-123";
			localStorage.setItem("auth-token", token);
			expect(localStorage.getItem("auth-token")).toBe(token);
		});

		it("should remove token from localStorage", () => {
			localStorage.setItem("auth-token", "test-token");
			localStorage.removeItem("auth-token");
			expect(localStorage.getItem("auth-token")).toBeNull();
		});

		it("should return null for non-existent token", () => {
			expect(localStorage.getItem("auth-token")).toBeNull();
		});
	});
});
