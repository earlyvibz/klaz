import { createFileRoute, useNavigate } from "@tanstack/react-router";
import Pagination from "@/components/pagination/pagination";
import Pending from "@/components/pending/pending";
import TableUsers from "@/components/tables/table-users";
import { tuyau } from "@/main";
import type {
	PaginatedStudentsResponse,
	PaginationSearchParams,
} from "@/types";

export const Route = createFileRoute("/_dashboard/users")({
	component: Users,
	validateSearch: (search: Record<string, unknown>): PaginationSearchParams => {
		return {
			page: (search.page as number) || 1,
			limit: (search.limit as number) || 10,
		};
	},
	loaderDeps: ({ search }) => ({
		page: search.page || 1,
		limit: search.limit || 10,
	}),
	loader: async ({ deps }) => {
		const response = await tuyau.students.$get({
			query: { page: deps.page, limit: deps.limit },
		});

		return response;
	},
	pendingComponent: Pending,
});

function Users() {
	const response = Route.useLoaderData();
	const { limit } = Route.useSearch();
	const navigate = useNavigate();

	if (response.error) {
		// @ts-ignore
		return <div>Erreur: {response.error.value.errors[0].message}</div>;
	}

	const data = response.data as PaginatedStudentsResponse;
	const currentLimit = limit || 10;

	const handlePageChange = (newPage: number) => {
		navigate({
			to: "/users",
			search: { page: newPage, limit: currentLimit },
		});
	};

	const handleLimitChange = (newLimit: number) => {
		navigate({
			to: "/users",
			search: { page: 1, limit: newLimit },
		});
	};

	return (
		<div className="space-y-6">
			<div className="bg-white">
				<TableUsers users={data.students} />

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
