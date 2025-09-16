import { Card, CardContent, CardHeader, CardTitle } from "@klaz/ui";
import type { AnalyticsResponse } from "@/types";

interface AnalyticsRecentPurchasesProps {
	data: AnalyticsResponse;
}

export function AnalyticsRecentPurchases({
	data,
}: AnalyticsRecentPurchasesProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Achats récents</CardTitle>
			</CardHeader>
			<CardContent>
				{data.recentPurchases.length > 0 ? (
					<div className="space-y-4">
						{data.recentPurchases.map((purchase) => (
							<div
								key={purchase.id}
								className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
							>
								<div>
									<p className="font-medium">{purchase.product.title}</p>
									<p className="text-sm text-muted-foreground">
										{purchase.user.firstName} {purchase.user.lastName}
									</p>
								</div>
								<div className="text-right">
									<p className="font-semibold text-orange-600">
										{purchase.totalPoints} pts
									</p>
									<p className="text-xs text-muted-foreground">
										{purchase.createdAt
											? new Date(purchase.createdAt).toLocaleDateString(
													"fr-FR",
													{
														day: "numeric",
														month: "short",
														hour: "2-digit",
														minute: "2-digit",
													},
												)
											: "Date inconnue"}
									</p>
								</div>
							</div>
						))}
					</div>
				) : (
					<p className="text-center text-muted-foreground py-8">
						Aucun achat récent
					</p>
				)}
			</CardContent>
		</Card>
	);
}
