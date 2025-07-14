export interface Student {
	id: string;
	fullName: string | null;
	email: string;
	role: "STUDENT" | "ADMIN" | "SUPERADMIN";
	level: number;
	points: number;
	groupId: string | null;
	createdAt: string;
	lastLoginAt: string | null;
	group: {
		id: string;
		name: string;
	} | null;
}

export interface PaginatedStudentsResponse {
	data: Student[];
	meta: {
		currentPage: number;
		lastPage: number;
		perPage: number;
		total: number;
	};
}
