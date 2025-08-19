import { BaseModelDto } from "@adocasts.com/dto/base";
import type { DateTime } from "luxon";
import QuestDto from "#dtos/quest";
import UserDto from "#dtos/user";
import type QuestSubmission from "#models/quest_submission";

export default class QuestSubmissionDto extends BaseModelDto {
	declare id: string;
	declare userId: string;
	declare questId: string;
	declare proofUrl: string;
	declare status: "PENDING" | "APPROVED" | "REJECTED";
	declare feedback?: string;
	declare submittedAt: DateTime;
	declare user: UserDto | null;
	declare quest: QuestDto | null;
	declare createdAt: DateTime;
	declare updatedAt: DateTime;

	constructor(questSubmission?: QuestSubmission) {
		super();

		if (!questSubmission) return;
		this.id = questSubmission.id;
		this.userId = questSubmission.userId;
		this.questId = questSubmission.questId;
		this.proofUrl = questSubmission.proofUrl;
		this.status = questSubmission.status;
		this.feedback = questSubmission.feedback;
		this.submittedAt = questSubmission.submittedAt;
		this.user = questSubmission.user && new UserDto(questSubmission.user);
		this.quest = questSubmission.quest && new QuestDto(questSubmission.quest);
		this.createdAt = questSubmission.createdAt;
		this.updatedAt = questSubmission.updatedAt;
	}
}
