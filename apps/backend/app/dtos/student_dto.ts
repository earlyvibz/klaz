import type User from "#models/user";

export class StudentDto {
	constructor(private user: User) {}

	toJson() {
		return {
			id: this.user.id,
			fullName: this.user.fullName,
			email: this.user.email,
			role: this.user.role,
			level: this.user.level,
			points: this.user.points,
			groupId: this.user.groupId,
			createdAt: this.user.createdAt.toISO(),
			lastLoginAt: this.user.lastLoginAt?.toISO() || null,
			group: this.user.group
				? {
						id: this.user.group.id,
						name: this.user.group.name,
					}
				: null,
		};
	}

	static fromUser(user: User) {
		return new StudentDto(user).toJson();
	}

	static fromUsers(users: User[]) {
		return users.map((user) => StudentDto.fromUser(user));
	}
}
