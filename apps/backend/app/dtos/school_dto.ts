import type School from "#models/school";

export default class SchoolDto {
	declare id: string;
	declare name: string;
	declare slug: string;
	declare usersCount: number;
	declare groupsCount: number;
	declare createdAt: string;
	declare updatedAt: string;

	constructor(school: School) {
		this.id = school.id;
		this.name = school.name;
		this.slug = school.slug;
		this.usersCount = school.$extras.users_count || 0;
		this.groupsCount = school.$extras.groups_count || 0;
		this.createdAt = school.createdAt.toISO() || school.createdAt.toString();
		this.updatedAt = school.updatedAt.toISO() || school.updatedAt.toString();
	}
}
