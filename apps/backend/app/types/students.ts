export interface CreateUserData {
	email: string;
	fullName: string | null;
	password: string;
	schoolId: string;
	role: "STUDENT";
	isActive: boolean;
	level: number;
	points: number;
}

export interface CreateInvitationData {
	schoolEmail: string;
	fullName: string | null;
	invitationCode: string;
	schoolId: string;
	groupId?: string | null;
	isUsed: boolean;
	expiresAt: Date;
}
