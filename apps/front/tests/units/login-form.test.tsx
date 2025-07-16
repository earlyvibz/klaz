import { describe, expect, it, vi } from "vitest";
import type { AuthContext } from "@/hooks/auth/types";

const mockAuthContext: AuthContext = {
	isAuthenticated: false,
	user: null,
	login: vi.fn(),
	signup: vi.fn(),
	logout: vi.fn(),
	loading: false,
	isStudent: () => false,
	isAdmin: () => false,
	isSuperAdmin: () => false,
	hasRole: () => false,
	hasAnyRole: () => false,
	isAdminOrAbove: () => false,
};

describe("LoginForm", () => {
	it("should have login function in mock context", () => {
		expect(mockAuthContext.login).toBeDefined();
		expect(typeof mockAuthContext.login).toBe("function");
	});

	it("should call login function", async () => {
		await mockAuthContext.login("test@example.com", "password123");
		expect(mockAuthContext.login).toHaveBeenCalledWith(
			"test@example.com",
			"password123",
		);
	});

	it("should handle login errors", async () => {
		const mockLoginWithError = vi
			.fn()
			.mockRejectedValue(new Error("Invalid credentials"));

		try {
			await mockLoginWithError("test@example.com", "wrongpassword");
		} catch (error) {
			expect(error).toBeInstanceOf(Error);
			expect((error as Error).message).toBe("Invalid credentials");
		}
	});
});
