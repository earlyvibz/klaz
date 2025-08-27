import CardQuest from "@/features/students/quests/card-quest";
import type { Quest, Quests } from "@/types";

export default function RecentQuests({ quests }: { quests: Quests }) {
	if (!quests || quests.length === 0) {
		return null;
	}

	return (
		<div>
			<h2 className="text-xl font-bold mb-4">Quêtes récentes</h2>
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{quests.map((quest: Quest) => (
					<CardQuest quest={quest} key={quest.id} />
				))}
			</div>
		</div>
	);
}
