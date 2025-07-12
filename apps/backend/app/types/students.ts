export interface CreateUserData {
	email: string;
	fullName: string | null;
	password: string;
	invitationCode: string;
	schoolId: string;
	role: "STUDENT";
	isActive: boolean;
	level: number;
	points: number;
}
