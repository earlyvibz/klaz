import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/quests")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/_dashboard/quests"!</div>;
}
