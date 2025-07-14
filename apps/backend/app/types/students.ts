export interface StudentCreateData {
	firstName: string | null;
	lastName: string | null;
	email: string;
	role: "STUDENT" | "ADMIN" | "SUPERADMIN";
	level?: number;
	points?: number;
	schoolId: string;
	groupId?: string | null;
	isActive?: boolean;
}

export interface StudentUpdateData {
	firstName?: string | null;
	lastName?: string | null;
	email?: string;
	level?: number;
	points?: number;
	groupId?: string | null;
	isActive?: boolean;
}

export interface StudentResponseData {
	id: string;
	firstName: string | null;
	lastName: string | null;
	displayName: string;
	email: string;
	role: string;
	level: number;
	points: number;
	isActive: boolean;
	groupId: string | null;
	createdAt: string;
	lastLoginAt: string | null;
	group: {
		id: string;
		name: string;
	} | null;
}
