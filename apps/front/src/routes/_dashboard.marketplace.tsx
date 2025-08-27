import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/marketplace")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Marketplace</div>;
}
