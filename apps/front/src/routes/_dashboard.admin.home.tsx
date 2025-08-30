import { createFileRoute } from "@tanstack/react-router";
import Pending from "@/components/pending/pending";
import Stats from "@/features/admin/home/stats";
import { tuyau } from "@/main";

export const Route = createFileRoute("/_dashboard/admin/home")({
	loader: async () => {
		const response = await tuyau.students.count.$get();
		if (response.error) {
			throw response.error;
		}
		return {
			studentsCount: response.data,
		};
	},
	component: AdminHome,
	pendingComponent: Pending,
});

function AdminHome() {
	const response = Route.useLoaderData();

	return (
		<div className="p-6">
			<Stats studentsCount={response?.studentsCount ?? { count: 0 }} />
		</div>
	);
}
