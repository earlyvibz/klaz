export enum UserRole {
	STUDENT = "STUDENT",
	ADMIN = "ADMIN",
	SUPERADMIN = "SUPERADMIN",
}

export type User = {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	role: "STUDENT" | "ADMIN" | "SUPERADMIN";
	schoolId: string;
	group: unknown;
};

export interface AuthContext {
	isAuthenticated: boolean;
	user: User | null;
	login: (email: string, password: string) => Promise<void>;
	signup: (
		email: string,
		invitationCode: string,
		password: string,
	) => Promise<void>;
	logout: () => Promise<void>;
	loading: boolean;
	// Role utilities
	isStudent: () => boolean;
	isAdmin: () => boolean;
	isSuperAdmin: () => boolean;
	hasRole: (role: UserRole) => boolean;
	hasAnyRole: (roles: UserRole[]) => boolean;
	isAdminOrAbove: () => boolean;
}
