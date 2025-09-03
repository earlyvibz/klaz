import { createFileRoute } from "@tanstack/react-router";
import Pending from "@/components/pending/pending";
import RecentQuests from "@/features/students/home/recent-quests";
import StudentStats from "@/features/students/home/student-stats";
import { tuyau } from "@/main";
import useAuth from "@/stores/auth-store";

export const Route = createFileRoute("/_dashboard/home")({
	loader: async () => {
		const questsResponse = await tuyau.quests.$get({
			query: { page: 1, limit: 3, status: "available" },
		});
		return {
			recentQuests: questsResponse.data?.quests || [],
		};
	},
	component: Home,
	pendingComponent: Pending,
});

function Home() {
	const { user } = useAuth();
	const response = Route.useLoaderData();

	if (!user) {
		return <div className="p-6">Welcome!</div>;
	}

	return (
		<div className="p-6 space-y-6">
			<StudentStats user={user} />
			{response?.recentQuests && (
				<RecentQuests quests={response.recentQuests} />
			)}
		</div>
	);
}
