import {
	createFileRoute,
	useNavigate,
	useRouterState,
} from "@tanstack/react-router";
import Pending from "@/components/pending/pending";
import CardQuest from "@/features/students/quests/card-quest";
import QuestFilters, {
	type QuestFilter,
} from "@/features/students/quests/quest-filters";
import { tuyau } from "@/main";
import type { Quest } from "@/types";

type QuestSearchParams = {
	status?: QuestFilter;
	page?: number;
};

export const Route = createFileRoute("/_dashboard/quests")({
	component: Quests,
	validateSearch: (search: Record<string, unknown>): QuestSearchParams => {
		return {
			status: (search.status as QuestFilter) || "all",
			page: Number(search.page) || 1,
		};
	},
	loaderDeps: ({ search }) => ({
		status: search.status || "all",
		page: search.page || 1,
	}),
	loader: async ({ deps }) => {
		const questsResponse = await tuyau.quests.$get({
			query: {
				status: deps.status,
				page: deps.page,
				limit: 50,
			},
		});

		return {
			quests: questsResponse.data?.quests || [],
		};
	},
	pendingComponent: Pending,
});

function Quests() {
	const { quests } = Route.useLoaderData();
	const { status } = Route.useSearch();
	const navigate = useNavigate({ from: "/quests" });
	const routerState = useRouterState();

	const currentFilter = status || "all";
	const isLoading = routerState.status === "pending";

	const handleFilterChange = (newFilter: QuestFilter) => {
		// Éviter le rechargement si c'est le même filtre
		if (newFilter === currentFilter) return;

		// TanStack Router va automatiquement recharger les données via loaderDeps
		navigate({
			search: { status: newFilter, page: 1 },
			replace: true,
		});
	};

	// Si aucune quête disponible, afficher le message d'état vide
	if (quests.length === 0 && currentFilter === "all") {
		return (
			<div className="flex flex-col items-center justify-center py-16 text-center">
				<div className="text-6xl mb-4">🎯</div>
				<h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
					Aucune quête disponible
				</h2>
				<p className="text-gray-600 dark:text-gray-400 max-w-md">
					Il n'y a aucune quête disponible pour le moment. Revenez plus tard
					pour de nouveaux défis !
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
							Complétez les quêtes pour gagner des points et des récompenses
						</p>
					</div>
					<div className="text-sm text-gray-500 dark:text-gray-400">
						{quests.length} quête{quests.length !== 1 ? "s" : ""} affichée
						{quests.length !== 1 ? "s" : ""}
					</div>
				</div>

				<QuestFilters
					activeFilter={currentFilter}
					onFilterChange={handleFilterChange}
				/>
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
