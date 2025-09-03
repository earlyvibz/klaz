import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
	type QuestFilters,
	QuestFiltersComponent,
} from "@/components/filters/quest-filters";
import Pagination from "@/components/pagination/pagination";
import { reviewedColumns } from "@/features/quests/columns-reviewed";
import { DataTable } from "@/features/quests/data-table";
import { getFilterData } from "@/lib/quest-filters-data";
import { tuyau } from "@/main";

export const Route = createFileRoute("/_dashboard/quests/approved")({
	component: QuestsApproved,
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
		hasComment?: boolean;
		adminId?: string;
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
			hasComment:
				search.hasComment === "true"
					? true
					: search.hasComment === "false"
						? false
						: undefined,
			adminId: search.adminId as string,
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
		hasComment: search.hasComment,
		adminId: search.adminId,
	}),
	loader: async ({ deps }) => {
		const [questsResponse, filterData] = await Promise.all([
			tuyau.quests.submissions.$get({
				query: {
					page: deps.page,
					limit: deps.limit,
					status: "APPROVED",
					search: deps.search,
					school: deps.school,
					quest: deps.quest,
					dateFrom: deps.dateFrom,
					dateTo: deps.dateTo,
					pointsMin: deps.pointsMin,
					pointsMax: deps.pointsMax,
					hasComment: deps.hasComment,
					adminId: deps.adminId,
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

function QuestsApproved() {
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
		hasComment: searchParams.hasComment,
		adminId: searchParams.adminId,
	};

	const handlePageChange = (newPage: number) => {
		navigate({
			to: "/quests/approved",
			search: { ...searchParams, page: newPage },
		});
	};

	const handleLimitChange = (newLimit: number) => {
		navigate({
			to: "/quests/approved",
			search: { ...searchParams, page: 1, limit: newLimit },
		});
	};

	const handleFiltersChange = (newFilters: QuestFilters) => {
		navigate({
			to: "/quests/approved",
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
				<h1 className="text-2xl font-bold">Quêtes validées</h1>
				<p className="text-muted-foreground">
					Historique des soumissions approuvées
				</p>
			</div>

			<QuestFiltersComponent
				filters={currentFilters}
				onFiltersChange={handleFiltersChange}
				schools={filterData.schools}
				quests={filterData.quests}
				showReviewedFilters={true}
			/>

			<DataTable columns={reviewedColumns} data={quests} />

			<Pagination
				meta={meta}
				currentLimit={searchParams.limit || 25}
				onPageChange={handlePageChange}
				onLimitChange={handleLimitChange}
			/>
		</div>
	);
}
