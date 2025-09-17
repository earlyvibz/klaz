import { Card, CardContent, CardHeader, CardTitle } from "@klaz/ui";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import Pagination from "@/components/pagination/pagination";
import Pending from "@/components/pending/pending";
import { StudentsTable } from "@/features/admin/students/students-table";
import { tuyau } from "@/main";
import type {
	PaginatedStudentsResponse,
	SearchPaginationParams,
} from "@/types";

export const Route = createFileRoute("/_dashboard/admin/users")({
	component: StudentsPage,
	validateSearch: (search: Record<string, unknown>): SearchPaginationParams => {
		return {
			page: Number(search.page) || 1,
			limit: Number(search.limit) || 10,
			search: String(search.search || ""),
		};
	},
	loaderDeps: ({ search }) => ({
		page: search.page || 1,
		limit: search.limit || 10,
		search: search.search || "",
	}),
	loader: async ({ deps }) => {
		const studentsResponse = await tuyau.students.$get({
			query: {
				page: deps.page,
				limit: deps.limit,
				...(deps.search && { search: deps.search }),
			},
		});

		return studentsResponse;
	},
	pendingComponent: Pending,
});

function StudentsPage() {
	const response = Route.useLoaderData();
	const { limit, search } = Route.useSearch();
	const navigate = useNavigate();

	if (response.error) {
		return (
			<div>
				Erreur:{" "}
				{(response.error.value as { errors?: { message: string }[] })
					?.errors?.[0]?.message || "Une erreur est survenue"}
			</div>
		);
	}

	const data = response.data as PaginatedStudentsResponse;
	const currentLimit = limit || 10;
	const currentSearch = search || "";

	const handlePageChange = (newPage: number) => {
		navigate({
			to: "/admin/users",
			search: {
				page: newPage,
				limit: currentLimit,
				...(currentSearch && { search: currentSearch }),
			},
		});
	};

	const handleLimitChange = (newLimit: number) => {
		navigate({
			to: "/admin/users",
			search: {
				page: 1,
				limit: newLimit,
				...(currentSearch && { search: currentSearch }),
			},
		});
	};

	const handleSearchChange = (newSearch: string) => {
		navigate({
			to: "/admin/users",
			search: {
				page: 1,
				limit: currentLimit,
				...(newSearch && { search: newSearch }),
			},
		});
	};

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Étudiants ({data.meta.total})</CardTitle>
				</CardHeader>
				<CardContent>
					<StudentsTable
						students={data.students}
						searchValue={currentSearch}
						onSearchChange={handleSearchChange}
					/>

					{data.meta.lastPage > 1 && (
						<div className="mt-8">
							<Pagination
								meta={data.meta}
								currentLimit={currentLimit}
								onPageChange={handlePageChange}
								onLimitChange={handleLimitChange}
							/>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
