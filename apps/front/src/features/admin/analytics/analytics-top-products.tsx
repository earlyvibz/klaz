import { Card, CardContent, CardHeader, CardTitle } from "@klaz/ui";
import type { AnalyticsResponse } from "@/types";

interface AnalyticsTopProductsProps {
	data: AnalyticsResponse;
}

export function AnalyticsTopProducts({ data }: AnalyticsTopProductsProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Produits les plus vendus (30 derniers jours)</CardTitle>
			</CardHeader>
			<CardContent>
				{data.topProducts.length > 0 ? (
					<div className="space-y-4">
						{data.topProducts.map((item, index) => (
							<div
								key={item.product.id}
								className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
							>
								<div className="flex items-center gap-3">
									<div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-orange-600 font-semibold text-sm">
										#{index + 1}
									</div>
									<div>
										<p className="font-medium">{item.product.title}</p>
										<p className="text-sm text-muted-foreground">
											{item.product.pricePoints} points
										</p>
									</div>
								</div>
								<div className="text-right">
									<p className="font-semibold">{item.sales}</p>
									<p className="text-xs text-muted-foreground">ventes</p>
								</div>
							</div>
						))}
					</div>
				) : (
					<p className="text-center text-muted-foreground py-8">
						Aucune vente dans les 30 derniers jours
					</p>
				)}
			</CardContent>
		</Card>
	);
}
