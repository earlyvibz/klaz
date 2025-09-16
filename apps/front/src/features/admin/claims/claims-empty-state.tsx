import { IconClipboardCheck } from "@tabler/icons-react";

export function ClaimsEmptyState() {
	return (
		<div className="text-center py-12">
			<IconClipboardCheck className="mx-auto h-12 w-12 text-gray-400 mb-4" />
			<h3 className="text-lg font-medium text-gray-900 mb-2">
				Aucune réclamation en attente
			</h3>
			<p className="text-gray-500">
				Toutes les réclamations ont été traitées ou il n'y en a aucune pour le
				moment.
			</p>
		</div>
	);
}
