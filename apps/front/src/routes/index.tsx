import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	beforeLoad: ({ context }) => {
		if (context.auth.loading) {
			return;
		}

		if (context.auth.isAuthenticated) {
			throw redirect({
				to: "/home",
			});
		}
	},
	component: Index,
});

function Index() {
	return (
		<div className="p-2">
			<h3>Welcome Home!</h3>
			<p>Page d'accueil publique</p>
		</div>
	);
}
