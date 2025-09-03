import {
	createFileRoute,
	useNavigate,
	useRouterState,
} from "@tanstack/react-router";
import Pending from "@/components/pending/pending";
import DisplayQuests from "@/features/shared/quests/display-quests";
import type { QuestFilter } from "@/features/students/quests/quest-filters";
import { tuyau } from "@/main";
import type { QuestSearchParams } from "@/types/interface";

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
		if (newFilter === currentFilter) return;

		navigate({
			search: { status: newFilter, page: 1 },
			replace: true,
		});
	};

	return (
		<DisplayQuests
			quests={quests}
			currentFilter={currentFilter}
			handleFilterChange={handleFilterChange}
			isLoading={isLoading}
		/>
	);
}
