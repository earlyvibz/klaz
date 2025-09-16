import { IconClipboardCheck } from "@tabler/icons-react";

export function ClaimsHeader() {
	return (
		<div className="mb-8">
			<h1 className="text-3xl font-bold flex items-center gap-3">
				<IconClipboardCheck className="h-8 w-8 text-blue-600" />
				Réclamations en attente
			</h1>
			<p className="text-muted-foreground">
				Gérez les demandes de récupération de produits des étudiants
			</p>
		</div>
	);
}
