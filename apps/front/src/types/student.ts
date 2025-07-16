export interface Student {
	id: string;
	firstName: string | null;
	lastName: string | null;
	displayName: string;
	email: string;
	level: number;
	points: number;
	isActive: boolean;
	role: string;
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
