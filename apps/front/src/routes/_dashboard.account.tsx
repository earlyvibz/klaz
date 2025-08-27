import { createFileRoute } from "@tanstack/react-router";
import Spinner from "@/components/spinner/spinner";
import { PasswordChangeForm } from "../components/forms/password-change-form";
import { DangerZoneCard } from "../features/account/danger-zone-card";
import { UserInfoCard } from "../features/account/user-info-card";
import useAuth from "../stores/auth-store";

export const Route = createFileRoute("/_dashboard/account")({
	component: RouteComponent,
});

function RouteComponent() {
	const { user } = useAuth();

	if (!user) {
		return (
			<div className="flex h-screen items-center justify-center">
				<Spinner />
			</div>
		);
	}

	return (
		<div className="container mx-auto max-w-2xl p-6 space-y-6">
			<div>
				<h1 className="text-3xl font-bold">Mon compte</h1>
				<p className="text-muted-foreground">
					Gérez vos paramètres de sécurité et consultez vos informations
				</p>
			</div>

			<UserInfoCard user={user} />
			<PasswordChangeForm />
			<DangerZoneCard />
		</div>
	);
}
