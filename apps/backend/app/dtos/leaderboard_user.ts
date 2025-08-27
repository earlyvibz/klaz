import { BaseModelDto } from "@adocasts.com/dto/base";
import type User from "#models/user";

export default class LeaderboardUserDto extends BaseModelDto {
	declare rank: number;
	declare id: string;
	declare firstName: string | null;
	declare lastName: string | null;
	declare points: number;
	declare level: number;
	declare completedQuests: number;

	constructor(user?: User, rank?: number, completedQuests?: number) {
		super();

		if (!user) return;
		this.id = user.id;
		this.firstName = user.firstName;
		this.lastName = user.lastName;
		this.points = user.points;
		this.level = user.level;
		this.rank = rank || 0;
		this.completedQuests = completedQuests || 0;
	}

	toJson() {
		return {
			id: this.id,
			firstName: this.firstName,
			lastName: this.lastName,
			points: this.points,
			level: this.level,
			completedQuests: this.completedQuests,
			rank: this.rank,
		};
	}
}
