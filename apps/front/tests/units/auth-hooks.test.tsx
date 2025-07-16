import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AuthContextInstance } from "@/hooks/auth/context";
import {
	useHasAnyRole,
	useHasRole,
	useIsAdmin,
	useIsAdminOrAbove,
	useIsStudent,
	useIsSuperAdmin,
} from "@/hooks/auth/hooks";
import type { AuthContext, User } from "@/hooks/auth/types";
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

const createAuthContextValue = (user: User | null): AuthContext => ({
	isAuthenticated: !!user,
	user,
	login: vi.fn(),
	signup: vi.fn(),
	logout: vi.fn(),
	loading: false,
	isStudent: () => user?.role === "STUDENT",
	isAdmin: () => user?.role === "ADMIN",
	isSuperAdmin: () => user?.role === "SUPERADMIN",
	hasRole: (role: UserRole) => user?.role === role,
	hasAnyRole: (roles: UserRole[]) => roles.some((role) => user?.role === role),
	isAdminOrAbove: () => user?.role === "ADMIN" || user?.role === "SUPERADMIN",
});

const wrapper = (authContext: AuthContext) =>
	function TestWrapper({ children }: { children: React.ReactNode }) {
		return (
			<AuthContextInstance.Provider value={authContext}>
				{children}
			</AuthContextInstance.Provider>
		);
	};

describe("Auth Hooks", () => {
	describe("useIsStudent", () => {
		it("should return true for student user", () => {
			const user = createMockUser("STUDENT");
			const { result } = renderHook(() => useIsStudent(), {
				wrapper: wrapper(createAuthContextValue(user)),
			});
			expect(result.current).toBe(true);
		});

		it("should return false for admin user", () => {
			const user = createMockUser("ADMIN");
			const { result } = renderHook(() => useIsStudent(), {
				wrapper: wrapper(createAuthContextValue(user)),
			});
			expect(result.current).toBe(false);
		});

		it("should return false for super admin user", () => {
			const user = createMockUser("SUPERADMIN");
			const { result } = renderHook(() => useIsStudent(), {
				wrapper: wrapper(createAuthContextValue(user)),
			});
			expect(result.current).toBe(false);
		});
	});

	describe("useIsAdmin", () => {
		it("should return true for admin user", () => {
			const user = createMockUser("ADMIN");
			const { result } = renderHook(() => useIsAdmin(), {
				wrapper: wrapper(createAuthContextValue(user)),
			});
			expect(result.current).toBe(true);
		});

		it("should return false for student user", () => {
			const user = createMockUser("STUDENT");
			const { result } = renderHook(() => useIsAdmin(), {
				wrapper: wrapper(createAuthContextValue(user)),
			});
			expect(result.current).toBe(false);
		});

		it("should return false for super admin user", () => {
			const user = createMockUser("SUPERADMIN");
			const { result } = renderHook(() => useIsAdmin(), {
				wrapper: wrapper(createAuthContextValue(user)),
			});
			expect(result.current).toBe(false);
		});
	});

	describe("useIsSuperAdmin", () => {
		it("should return true for super admin user", () => {
			const user = createMockUser("SUPERADMIN");
			const { result } = renderHook(() => useIsSuperAdmin(), {
				wrapper: wrapper(createAuthContextValue(user)),
			});
			expect(result.current).toBe(true);
		});

		it("should return false for admin user", () => {
			const user = createMockUser("ADMIN");
			const { result } = renderHook(() => useIsSuperAdmin(), {
				wrapper: wrapper(createAuthContextValue(user)),
			});
			expect(result.current).toBe(false);
		});

		it("should return false for student user", () => {
			const user = createMockUser("STUDENT");
			const { result } = renderHook(() => useIsSuperAdmin(), {
				wrapper: wrapper(createAuthContextValue(user)),
			});
			expect(result.current).toBe(false);
		});
	});

	describe("useHasRole", () => {
		it("should return true when user has the specified role", () => {
			const user = createMockUser("ADMIN");
			const { result } = renderHook(() => useHasRole(UserRole.ADMIN), {
				wrapper: wrapper(createAuthContextValue(user)),
			});
			expect(result.current).toBe(true);
		});

		it("should return false when user does not have the specified role", () => {
			const user = createMockUser("STUDENT");
			const { result } = renderHook(() => useHasRole(UserRole.ADMIN), {
				wrapper: wrapper(createAuthContextValue(user)),
			});
			expect(result.current).toBe(false);
		});
	});

	describe("useHasAnyRole", () => {
		it("should return true when user has one of the specified roles", () => {
			const user = createMockUser("ADMIN");
			const { result } = renderHook(
				() => useHasAnyRole([UserRole.ADMIN, UserRole.SUPERADMIN]),
				{
					wrapper: wrapper(createAuthContextValue(user)),
				},
			);
			expect(result.current).toBe(true);
		});

		it("should return false when user has none of the specified roles", () => {
			const user = createMockUser("STUDENT");
			const { result } = renderHook(
				() => useHasAnyRole([UserRole.ADMIN, UserRole.SUPERADMIN]),
				{
					wrapper: wrapper(createAuthContextValue(user)),
				},
			);
			expect(result.current).toBe(false);
		});
	});

	describe("useIsAdminOrAbove", () => {
		it("should return true for admin user", () => {
			const user = createMockUser("ADMIN");
			const { result } = renderHook(() => useIsAdminOrAbove(), {
				wrapper: wrapper(createAuthContextValue(user)),
			});
			expect(result.current).toBe(true);
		});

		it("should return true for super admin user", () => {
			const user = createMockUser("SUPERADMIN");
			const { result } = renderHook(() => useIsAdminOrAbove(), {
				wrapper: wrapper(createAuthContextValue(user)),
			});
			expect(result.current).toBe(true);
		});

		it("should return false for student user", () => {
			const user = createMockUser("STUDENT");
			const { result } = renderHook(() => useIsAdminOrAbove(), {
				wrapper: wrapper(createAuthContextValue(user)),
			});
			expect(result.current).toBe(false);
		});
	});
});
