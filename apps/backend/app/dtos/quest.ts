import { BaseModelDto } from "@adocasts.com/dto/base";
import type { DateTime } from "luxon";
import QuestSubmissionDto from "#dtos/quest_submission";
import SchoolDto from "#dtos/school";
import type Quest from "#models/quest";

export default class QuestDto extends BaseModelDto {
	declare id: string;
	declare title: string;
	declare description: string;
	declare type: string; // ex
	declare points: number;
	declare deadline?: DateTime;
	declare validationType: "MANUAL" | "AUTO_API";
	declare schoolId: string;
	declare isActive: boolean;
	declare school: SchoolDto | null;
	declare submissions: QuestSubmissionDto[];
	declare createdAt: DateTime;
	declare updatedAt: DateTime;

	constructor(quest?: Quest) {
		super();

		if (!quest) return;
		this.id = quest.id;
		this.title = quest.title;
		this.description = quest.description;
		this.type = quest.type;
		this.points = quest.points;
		this.deadline = quest.deadline;
		this.validationType = quest.validationType;
		this.schoolId = quest.schoolId;
		this.isActive = quest.isActive;
		this.school = quest.school && new SchoolDto(quest.school);
		this.submissions = QuestSubmissionDto.fromArray(quest.submissions);
		this.createdAt = quest.createdAt;
		this.updatedAt = quest.updatedAt;
	}
}
