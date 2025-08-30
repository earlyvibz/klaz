import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/admin/quests")({
	component: AdminQuests,
});

function AdminQuests() {
	return <div>Hello "/(admin)/_dashboard/admin/quests"!</div>;
}
