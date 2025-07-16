import { createFileRoute, redirect } from "@tanstack/react-router";
import { SignupForm } from "@/components/forms/signup-form";

export const Route = createFileRoute("/auth/signup")({
	beforeLoad: ({ context }) => {
		if (context.auth.loading) {
			return;
		}

		if (context.auth.isAuthenticated) {
			throw redirect({ to: "/home" });
		}
	},
	component: RouteComponent,
});

function RouteComponent() {
	return <SignupForm />;
}
