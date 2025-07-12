import { createFileRoute } from "@tanstack/react-router";
import { LoginForm } from "@/components/forms/login-form";

export const Route = createFileRoute("/login")({
	component: Login,
});

function Login() {
	return (
		<div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
			<div className="w-full max-w-sm md:max-w-3xl">
				<LoginForm />
			</div>
		</div>
	);
}
