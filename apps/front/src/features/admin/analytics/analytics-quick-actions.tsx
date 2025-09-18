import { Card, CardContent, CardHeader, CardTitle } from "@klaz/ui";
import { IconClock, IconPackage, IconShoppingCart } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import type { AnalyticsResponse } from "@/types";

interface AnalyticsQuickActionsProps {
	data: AnalyticsResponse;
}

export function AnalyticsQuickActions({ data }: AnalyticsQuickActionsProps) {
	return (
		<Card className="mt-8">
			<CardHeader>
				<CardTitle>Actions rapides</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<Link
						to="/admin/marketplace"
						className="flex items-center gap-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
					>
						<IconPackage className="h-5 w-5 text-blue-600" />
						<div>
							<p className="font-medium">Gérer les produits</p>
							<p className="text-sm text-muted-foreground">
								Ajouter, modifier ou supprimer des produits
							</p>
						</div>
					</Link>
					<Link
						to="/admin/claims"
						className="flex items-center gap-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
					>
						<IconClock className="h-5 w-5 text-yellow-600" />
						<div>
							<p className="font-medium">Réclamations</p>
							<p className="text-sm text-muted-foreground">
								{data.overview.pendingClaims} en attente
							</p>
						</div>
					</Link>
					<Link
						to="/admin/purchases"
						className="flex items-center gap-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
					>
						<IconShoppingCart className="h-5 w-5 text-purple-600" />
						<div>
							<p className="font-medium">Historique des achats</p>
							<p className="text-sm text-muted-foreground">
								Voir tous les achats
							</p>
						</div>
					</Link>
				</div>
			</CardContent>
		</Card>
	);
}
