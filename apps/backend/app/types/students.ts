export interface StudentCreateData {
	firstName: string | null;
	lastName: string | null;
	email: string;
	role: "STUDENT" | "ADMIN" | "SUPERADMIN";
	level?: number;
	points?: number;
	schoolId: string;
	isActive?: boolean;
}

export interface StudentUpdateData {
	firstName?: string | null;
	lastName?: string | null;
	email?: string;
	level?: number;
	points?: number;
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
	createdAt: string;
	lastLoginAt: string | null;
}

export type PaginationMeta = {
	total: number;
	perPage: number;
	currentPage: number;
	lastPage: number;
	firstPage: number;
	firstPageUrl: string;
	lastPageUrl: string;
	nextPageUrl: string | null;
	previousPageUrl: string | null;
};
