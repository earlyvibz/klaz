import { createFileRoute, useNavigate } from "@tanstack/react-router";
import GenericPagination from "@/components/pagination/generic-pagination";
import Pending from "@/components/pending/pending";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { tuyau } from "@/main";
import type { LeaderboardResponse } from "@/types";

type SearchParams = {
	page?: number;
	limit?: number;
};

export const Route = createFileRoute("/_dashboard/leaderboard")({
	component: Leaderboard,
	validateSearch: (search: Record<string, unknown>): SearchParams => {
		return {
			page: (search.page as number) || 1,
			limit: (search.limit as number) || 20,
		};
	},
	loaderDeps: ({ search }) => ({
		page: search.page || 1,
		limit: search.limit || 20,
	}),
	loader: async ({ deps }) => {
		const response = await tuyau.leaderboard.$get({
			query: { page: deps.page, limit: deps.limit },
		});
		return response;
	},
	pendingComponent: Pending,
});

function Leaderboard() {
	const response = Route.useLoaderData();
	const { limit } = Route.useSearch();
	const navigate = useNavigate();

	if (response.error) {
		return <div>Erreur lors du chargement du classement</div>;
	}

	const data = response.data as LeaderboardResponse & {
		meta?: {
			currentPage: number;
			lastPage: number;
			perPage: number;
			total: number;
		};
	};
	const leaderboard = data?.leaderboard || [];
	const school = data?.school;
	const meta = data?.meta;
	const currentLimit = limit || 20;

	const handlePageChange = (newPage: number) => {
		navigate({
			to: "/leaderboard",
			search: { page: newPage, limit: currentLimit },
		});
	};

	const handleLimitChange = (newLimit: number) => {
		navigate({
			to: "/leaderboard",
			search: { page: 1, limit: newLimit },
		});
	};

	const getRankDisplay = (rank: number) => {
		switch (rank) {
			case 1:
				return { icon: "🥇", class: "text-yellow-600 font-bold" };
			case 2:
				return { icon: "🥈", class: "text-gray-600 font-bold" };
			case 3:
				return { icon: "🥉", class: "text-amber-600 font-bold" };
			default:
				return { icon: `#${rank}`, class: "text-gray-500 font-medium" };
		}
	};

	const getRankRowStyle = (rank: number) => {
		switch (rank) {
			case 1:
				return "bg-gradient-to-r from-yellow-50 to-transparent dark:from-yellow-900/10";
			case 2:
				return "bg-gradient-to-r from-gray-50 to-transparent dark:from-gray-800/20";
			case 3:
				return "bg-gradient-to-r from-amber-50 to-transparent dark:from-amber-900/10";
			default:
				return "";
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
						🏆 Classement
					</h1>
					<p className="text-gray-600 dark:text-gray-400 mt-1">
						{school?.name} - Top {leaderboard.length} étudiants
					</p>
				</div>
				<Badge variant="secondary" className="text-sm">
					{meta?.total || leaderboard.length} étudiant
					{(meta?.total || leaderboard.length) !== 1 ? "s" : ""}
				</Badge>
			</div>

			<div className="bg-white">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="text-center w-20">Rang</TableHead>
							<TableHead>Étudiant</TableHead>
							<TableHead className="text-center">Niveau</TableHead>
							<TableHead className="text-center">Quêtes</TableHead>
							<TableHead className="text-center">Points</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{leaderboard.length > 0 ? (
							leaderboard.map((student) => {
								const rankDisplay = getRankDisplay(student.rank);
								return (
									<TableRow
										key={student.id}
										className={getRankRowStyle(student.rank)}
									>
										<TableCell className="text-center font-medium">
											<span className={rankDisplay.class}>
												{rankDisplay.icon}
											</span>
										</TableCell>
										<TableCell>
											<div className="flex items-center space-x-3">
												<Avatar className="h-8 w-8">
													<div className="h-full w-full rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
														{student.firstName?.[0]}
														{student.lastName?.[0]}
													</div>
												</Avatar>
												<div>
													<div className="font-medium text-gray-900 dark:text-gray-100">
														{student.firstName} {student.lastName}
													</div>
												</div>
											</div>
										</TableCell>
										<TableCell className="text-center">
											<Badge variant="outline">{student.level}</Badge>
										</TableCell>
										<TableCell className="text-center">
											<span className="text-gray-600 dark:text-gray-400">
												{student.completedQuests}
											</span>
										</TableCell>
										<TableCell className="text-center">
											<span className="font-bold text-lg text-gray-900 dark:text-gray-100">
												{student.points}
											</span>
										</TableCell>
									</TableRow>
								);
							})
						) : (
							<TableRow>
								<TableCell colSpan={5} className="text-center py-8">
									<div className="flex flex-col items-center space-y-2">
										<div className="text-4xl">🏆</div>
										<div className="text-lg font-medium text-gray-900 dark:text-gray-100">
											Aucun étudiant trouvé
										</div>
										<div className="text-gray-500 dark:text-gray-400">
											Il n'y a pas encore d'étudiants avec des points dans cette
											école.
										</div>
									</div>
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>

				{meta && (
					<GenericPagination
						meta={meta}
						currentLimit={currentLimit}
						onPageChange={handlePageChange}
						onLimitChange={handleLimitChange}
						itemLabel="étudiants"
					/>
				)}
			</div>
		</div>
	);
}
