import { useState } from "react";
import { useTenant } from "@/hooks/tenant";

export function TenantDevTools() {
	const {
		slug: currentSlug,
		isTenantMode,
		isAdminMode,
		isLandingMode,
	} = useTenant();
	const [isOpen, setIsOpen] = useState(false);

	// Afficher seulement en développement
	if (import.meta.env.PROD) {
		return null;
	}

	const getModeDisplay = () => {
		if (isTenantMode) return "🏢 Tenant";
		if (isAdminMode) return "👑 Admin";
		if (isLandingMode) return "🌍 Landing";
		return "❓ Inconnu";
	};

	if (!isOpen) {
		return (
			<div className="fixed bottom-4 right-4 z-50">
				<button
					type="button"
					onClick={() => setIsOpen(true)}
					className="bg-purple-600 text-white px-3 py-2 rounded-lg shadow-lg hover:bg-purple-700 text-sm font-medium"
				>
					🏢 Tenant Info
				</button>
			</div>
		);
	}

	return (
		<div className="fixed bottom-4 right-4 z-50 bg-white border border-gray-200 rounded-lg shadow-xl p-4 w-72">
			<div className="flex justify-between items-center mb-3">
				<h3 className="font-semibold text-gray-900">Tenant Info</h3>
				<button
					type="button"
					onClick={() => setIsOpen(false)}
					className="text-gray-400 hover:text-gray-600"
				>
					✕
				</button>
			</div>

			<div className="space-y-3">
				<div>
					<p className="text-sm text-gray-600 mb-1">URL:</p>
					<p className="font-mono text-xs bg-gray-100 p-2 rounded break-all">
						{window.location.href}
					</p>
				</div>

				<div>
					<p className="text-sm text-gray-600 mb-1">Subdomain:</p>
					<p className="font-medium text-purple-600">
						{currentSlug || "Aucun"}
					</p>
				</div>

				<div>
					<p className="text-sm text-gray-600 mb-1">Mode:</p>
					<p className="font-medium">{getModeDisplay()}</p>
				</div>

				<div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
					<p className="text-sm text-blue-700">
						💡 Tests rapides :<br />
						<code className="font-mono">localhost:5173</code> → Landing
						<br />
						<code className="font-mono">admin.localhost:5173</code> → Admin
						<br />
						<code className="font-mono">hec.localhost:5173</code> → Tenant
					</p>
				</div>
			</div>
		</div>
	);
}
