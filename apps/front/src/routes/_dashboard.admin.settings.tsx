import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/admin/settings")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/_dashboard/admin/settings"!</div>;
}
