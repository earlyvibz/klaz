import {
	createFileRoute,
	useNavigate,
	useRouterState,
} from "@tanstack/react-router";
import Pagination from "@/components/pagination/pagination";
import Pending from "@/components/pending/pending";
import DisplayQuests from "@/features/shared/quests/display-quests";
import type { QuestFilter } from "@/features/students/quests/quest-filters";
import { tuyau } from "@/main";
import type { QuestsResponse } from "@/types";

type SearchParams = {
	status?: QuestFilter;
	page?: number;
	limit?: number;
};

export const Route = createFileRoute("/_dashboard/admin/quests")({
	component: AdminQuests,
	validateSearch: (search: Record<string, unknown>): SearchParams => {
		return {
			status: (search.status as QuestFilter) || "all",
			page: Number(search.page) || 1,
			limit: Number(search.limit) || 10,
		};
	},
	loaderDeps: ({ search }) => ({
		status: search.status || "all",
		page: search.page || 1,
		limit: search.limit || 10,
	}),
	loader: async ({ deps }) => {
		const questsResponse = await tuyau.quests.$get({
			query: {
				status: deps.status,
				page: deps.page,
				limit: deps.limit,
			},
		});

		return questsResponse;
	},
	pendingComponent: Pending,
});

function AdminQuests() {
	const response = Route.useLoaderData();
	const { status, limit } = Route.useSearch();
	const navigate = useNavigate();
	const routerState = useRouterState();

	if (response.error) {
		// @ts-ignore
		return <div>Erreur: {response.error.value.errors[0].message}</div>;
	}

	const data = response.data as QuestsResponse;
	const currentFilter = status || "all";
	const isLoading = routerState.status === "pending";
	const currentLimit = limit || 10;

	const handleFilterChange = (newFilter: QuestFilter) => {
		if (newFilter === currentFilter) return;

		navigate({
			to: "/admin/quests",
			search: { status: newFilter, page: 1, limit: currentLimit },
			replace: true,
		});
	};

	const handlePageChange = (newPage: number) => {
		navigate({
			to: "/admin/quests",
			search: { status: currentFilter, page: newPage, limit: currentLimit },
		});
	};

	const handleLimitChange = (newLimit: number) => {
		navigate({
			to: "/admin/quests",
			search: { status: currentFilter, page: 1, limit: newLimit },
		});
	};

	return (
		<div className="space-y-6">
			<div className="bg-white">
				<DisplayQuests
					quests={data.quests}
					currentFilter={currentFilter}
					handleFilterChange={handleFilterChange}
					isLoading={isLoading}
				/>

				<Pagination
					meta={data.meta}
					currentLimit={currentLimit}
					onPageChange={handlePageChange}
					onLimitChange={handleLimitChange}
				/>
			</div>
		</div>
	);
}
