import type User from "#models/user";

export default class StudentDto {
	declare id: string;
	declare firstName: string | null;
	declare lastName: string | null;
	declare displayName: string;
	declare email: string;
	declare level: number;
	declare points: number;
	declare isActive: boolean;
	declare role: string;

	constructor(user: User) {
		this.id = user.id;
		this.firstName = user.firstName;
		this.lastName = user.lastName;
		this.displayName = user.displayName;
		this.email = user.email;
		this.level = user.level;
		this.points = user.points;
		this.isActive = user.isActive;
		this.role = user.role;
	}
}
