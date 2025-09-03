import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
	type QuestFilters,
	QuestFiltersComponent,
} from "@/components/filters/quest-filters";
import Pagination from "@/components/pagination/pagination";
import { pendingColumns } from "@/features/quests/columns-pending";
import { DataTable } from "@/features/quests/data-table";
import { getFilterData } from "@/lib/quest-filters-data";
import { tuyau } from "@/main";

export const Route = createFileRoute("/_dashboard/quests/pending")({
	component: QuestsPending,
	validateSearch: (
		search: Record<string, unknown>,
	): {
		page?: number;
		limit?: number;
		search?: string;
		school?: string;
		quest?: string;
		dateFrom?: string;
		dateTo?: string;
		pointsMin?: number;
		pointsMax?: number;
		olderThan?: string;
	} => {
		return {
			page: Number(search.page) || 1,
			limit: Number(search.limit) || 25,
			search: search.search as string,
			school: search.school as string,
			quest: search.quest as string,
			dateFrom: search.dateFrom as string,
			dateTo: search.dateTo as string,
			pointsMin: search.pointsMin ? Number(search.pointsMin) : undefined,
			pointsMax: search.pointsMax ? Number(search.pointsMax) : undefined,
			olderThan: search.olderThan as string,
		};
	},
	loaderDeps: ({ search }) => ({
		page: search.page || 1,
		limit: search.limit || 25,
		search: search.search,
		school: search.school,
		quest: search.quest,
		dateFrom: search.dateFrom,
		dateTo: search.dateTo,
		pointsMin: search.pointsMin,
		pointsMax: search.pointsMax,
		olderThan: search.olderThan,
	}),
	loader: async ({ deps }) => {
		const [questsResponse, filterData] = await Promise.all([
			tuyau.quests.submissions.$get({
				query: {
					page: deps.page,
					limit: deps.limit,
					status: "PENDING",
					search: deps.search,
					school: deps.school,
					quest: deps.quest,
					dateFrom: deps.dateFrom,
					dateTo: deps.dateTo,
					pointsMin: deps.pointsMin,
					pointsMax: deps.pointsMax,
					olderThan: deps.olderThan,
				},
			}),
			getFilterData(),
		]);

		return {
			quests: questsResponse.data?.submissions || [],
			meta: questsResponse.data?.meta || {},
			filterData,
		};
	},
});

function QuestsPending() {
	const { quests, meta, filterData } = Route.useLoaderData();
	const searchParams = Route.useSearch();
	const navigate = useNavigate();

	const currentFilters: QuestFilters = {
		search: searchParams.search,
		school: searchParams.school,
		quest: searchParams.quest,
		dateFrom: searchParams.dateFrom,
		dateTo: searchParams.dateTo,
		pointsMin: searchParams.pointsMin,
		pointsMax: searchParams.pointsMax,
		olderThan: searchParams.olderThan,
	};

	const handlePageChange = (newPage: number) => {
		navigate({
			to: "/quests/pending",
			search: { ...searchParams, page: newPage },
		});
	};

	const handleLimitChange = (newLimit: number) => {
		navigate({
			to: "/quests/pending",
			search: { ...searchParams, page: 1, limit: newLimit },
		});
	};

	const handleFiltersChange = (newFilters: QuestFilters) => {
		navigate({
			to: "/quests/pending",
			search: {
				...newFilters,
				page: 1, // Reset to first page when filters change
				limit: searchParams.limit || 25,
			},
		});
	};

	return (
		<div className="space-y-4">
			<div>
				<h1 className="text-2xl font-bold">Quêtes en attente</h1>
				<p className="text-muted-foreground">
					Vérifiez et validez les soumissions des étudiants
				</p>
			</div>

			<QuestFiltersComponent
				filters={currentFilters}
				onFiltersChange={handleFiltersChange}
				schools={filterData.schools}
				quests={filterData.quests}
				showPendingFilters={true}
			/>

			<DataTable columns={pendingColumns} data={quests} />

			<Pagination
				meta={meta}
				currentLimit={searchParams.limit || 25}
				onPageChange={handlePageChange}
				onLimitChange={handleLimitChange}
			/>
		</div>
	);
}
