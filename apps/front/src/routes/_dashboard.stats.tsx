import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/stats")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/stats"!</div>;
}
