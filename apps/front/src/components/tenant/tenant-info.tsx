import { useTenant } from "@/hooks/tenant";

export function TenantInfo() {
	const { school, slug, isTenantMode, isLoading } = useTenant();

	if (isLoading) {
		return (
			<div className="text-sm text-gray-500 p-2 bg-gray-50 rounded">
				Chargement du tenant...
			</div>
		);
	}

	if (!isTenantMode) {
		return (
			<div className="text-sm text-blue-600 p-2 bg-blue-50 rounded">
				Mode global - Aucun tenant actif
			</div>
		);
	}

	return (
		<div className="text-sm text-green-600 p-2 bg-green-50 rounded">
			<strong>Tenant actif:</strong> {school?.name} ({slug})
		</div>
	);
}
