import { Button } from "@klaz/ui";
import { IconPlus } from "@tabler/icons-react";
import { useState } from "react";
import QuestCreationModal from "@/features/admin/quests/quest-creation-modal";
import CardQuest from "@/features/students/quests/card-quest";
import type { QuestFilter } from "@/features/students/quests/quest-filters";
import QuestFilters from "@/features/students/quests/quest-filters";
import useAuth from "@/stores/auth-store";
import type { Quest } from "@/types";

interface DisplayQuestsProps {
	quests: Quest[];
	currentFilter: QuestFilter;
	handleFilterChange: (filter: QuestFilter) => void;
	isLoading: boolean;
}

export default function DisplayQuests({
	quests,
	currentFilter,
	handleFilterChange,
	isLoading,
}: DisplayQuestsProps) {
	const [isQuestModalOpen, setIsQuestModalOpen] = useState<boolean>(false);
	const { user } = useAuth();
	if (quests.length === 0 && currentFilter === "all") {
		return (
			<div className="flex flex-col items-center justify-center py-16 text-center">
				<div className="text-6xl mb-4">🎯</div>
				<h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
					Aucune quête disponible
				</h2>
				<p className="text-gray-600 dark:text-gray-400 max-w-md">
					{user?.isAdmin
						? "Aucune quête trouvée"
						: "Il n'y a aucune quête disponible pour le moment. Revenez plus tard pour de nouveaux défis !"}
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-4">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
							Quêtes disponibles
						</h1>
						<p className="text-gray-600 dark:text-gray-400 mt-1">
							{user?.isAdmin
								? "Gérez les quêtes disponibles pour vos étudiants"
								: "Complétez les quêtes pour gagner des points et des récompenses"}
						</p>
					</div>
					<div className="text-sm text-gray-500 dark:text-gray-400">
						{quests.length} quête{quests.length !== 1 ? "s" : ""} affichée
						{quests.length !== 1 ? "s" : ""}
					</div>
				</div>

				<div className="flex items-center gap-2 justify-between">
					<QuestFilters
						activeFilter={currentFilter}
						onFilterChange={handleFilterChange}
					/>

					{user?.isAdmin && (
						<>
							<Button onClick={() => setIsQuestModalOpen(true)}>
								<IconPlus />
								Ajouter une quête
							</Button>

							<QuestCreationModal
								open={isQuestModalOpen}
								onOpenChange={setIsQuestModalOpen}
							/>
						</>
					)}
				</div>
			</div>

			{quests.length === 0 ? (
				<div className="flex flex-col items-center justify-center py-16 text-center">
					<div className="text-6xl mb-4">🔍</div>
					<h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
						Aucune quête trouvée
					</h2>
					<p className="text-gray-600 dark:text-gray-400 max-w-md">
						Aucune quête ne correspond au filtre sélectionné. Essayez un autre
						filtre !
					</p>
				</div>
			) : (
				<div
					className={`grid gap-6 md:grid-cols-2 lg:grid-cols-3 transition-opacity duration-200 ${isLoading ? "opacity-60" : "opacity-100"}`}
				>
					{quests.map((quest: Quest) => (
						<CardQuest quest={quest} key={quest.id} />
					))}
				</div>
			)}
		</div>
	);
}
