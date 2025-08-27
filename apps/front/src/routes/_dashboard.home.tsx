import { createFileRoute } from "@tanstack/react-router";
import Pending from "@/components/pending/pending";
import Stats from "@/features/admin/home/stats";
import RecentQuests from "@/features/students/home/recent-quests";
import StudentStats from "@/features/students/home/student-stats";
import { tuyau } from "@/main";
import useAuth from "@/stores/auth-store";

export const Route = createFileRoute("/_dashboard/home")({
	loader: async () => {
		const { user } = useAuth.getState();

		if (user?.isAdmin) {
			const response = await tuyau.students.count.$get();
			if (response.error) {
				throw response.error;
			}
			return {
				studentsCount: response.data,
			};
		}

		if (user?.isStudent) {
			const questsResponse = await tuyau.quests.$get({
				query: { page: 1, limit: 3 },
			});
			return {
				recentQuests: questsResponse.data?.quests || [],
			};
		}
	},
	component: Home,
	pendingComponent: Pending,
});

function Home() {
	const { user } = useAuth();
	const response = Route.useLoaderData();

	if (user?.isStudent) {
		return (
			<div className="p-6 space-y-6">
				<StudentStats user={user} />
				{response?.recentQuests && (
					<RecentQuests quests={response.recentQuests} />
				)}
			</div>
		);
	}

	return (
		<div className="p-6">
			{user?.isAdmin && (
				<Stats studentsCount={response?.studentsCount ?? { count: 0 }} />
			)}
		</div>
	);
}
