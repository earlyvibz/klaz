import { createFileRoute, useNavigate } from "@tanstack/react-router";
import Pagination from "@/components/pagination/pagination";
import TableUsers from "@/components/tables/table-users";
import { tuyau } from "@/main";
import type { PaginatedStudentsResponse } from "@/types/student";

type SearchParams = {
	page?: number;
	limit?: number;
};

export const Route = createFileRoute("/_dashboard/users")({
	component: RouteComponent,
	validateSearch: (search: Record<string, unknown>): SearchParams => {
		return {
			page: (search.page as number) || 1,
			limit: (search.limit as number) || 10,
		};
	},
	loaderDeps: ({ search }) => ({
		page: search.page || 1,
		limit: search.limit || 10,
	}),
	loader: ({ context, deps }) => {
		const schoolId = context.auth.user?.schoolId;

		if (!schoolId) {
			throw new Error("User not authenticated or schoolId not available");
		}

		const response = tuyau.students.$get({
			query: { page: deps.page, limit: deps.limit },
		});
		return response;
	},
});

function RouteComponent() {
	const response = Route.useLoaderData();
	const { limit } = Route.useSearch();
	const navigate = useNavigate();

	if (response.error) {
		return <div>Erreur: {response.error.value.message}</div>;
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
				<TableUsers users={data.data || []} />

				{data.meta && (
					<Pagination
						meta={data.meta}
						currentLimit={currentLimit}
						onPageChange={handlePageChange}
						onLimitChange={handleLimitChange}
					/>
				)}
			</div>
		</div>
	);
}
