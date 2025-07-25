import { createFileRoute } from "@tanstack/react-router";
import { TenantInfo } from "@/components/tenant";
import { useTenant } from "@/hooks/tenant";

export const Route = createFileRoute("/_dashboard/home")({
	component: RouteComponent,
});

function RouteComponent() {
	const { isTenantMode, isAdminMode, isLandingMode, school } = useTenant();

	const getTitle = () => {
		if (isTenantMode) return `Dashboard - ${school?.name}`;
		if (isAdminMode) return "Administration Klaz";
		return "Klaz - Landing";
	};

	return (
		<div className="p-6">
			<h1 className="text-2xl font-bold mb-4">{getTitle()}</h1>

			<div className="mb-6">
				<TenantInfo />
			</div>

			<div className="grid gap-4">
				{isTenantMode && (
					<div className="p-4 border rounded bg-blue-50">
						<h2 className="text-lg font-semibold mb-2">🏢 Mode École</h2>
						<p>
							École : <strong>{school?.name}</strong>
						</p>
						<p>
							Slug : <strong>{school?.slug}</strong>
						</p>
						<p className="text-sm text-gray-600 mt-2">
							Interface pour les admins et étudiants de cette école
						</p>
					</div>
				)}

				{isAdminMode && (
					<div className="p-4 border rounded bg-purple-50">
						<h2 className="text-lg font-semibold mb-2">
							👑 Mode Administration
						</h2>
						<p>
							Interface réservée aux <strong>SUPERADMIN</strong>
						</p>
						<p className="text-sm text-gray-600 mt-2">
							Gestion globale de la plateforme et des écoles
						</p>
					</div>
				)}

				{isLandingMode && (
					<div className="p-4 border rounded bg-green-50">
						<h2 className="text-lg font-semibold mb-2">🌍 Landing Page</h2>
						<p>Page d'accueil publique de Klaz</p>
						<p className="text-sm text-gray-600 mt-2">
							Présentation du produit et inscription
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
