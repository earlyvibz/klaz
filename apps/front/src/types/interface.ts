import type { QuestFilter } from "@/features/students/quests/quest-filters";

export interface QuestSearchParams {
	status?: QuestFilter;
	page?: number;
}
