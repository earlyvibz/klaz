import { createFileRoute, redirect } from "@tanstack/react-router";
import { LoginForm } from "@/components/forms/login-form";

const fallback = "/stats" as const;

export const Route = createFileRoute("/auth/login")({
	beforeLoad: ({ context }) => {
		if (context.auth.loading) {
			return;
		}

		if (context.auth.isAuthenticated) {
			throw redirect({ to: fallback });
		}
	},
	component: Login,
});

function Login() {
	return <LoginForm />;
}
