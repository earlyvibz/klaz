import { Card, CardContent } from "@klaz/ui";
import {
	IconAlertTriangle,
	IconBan,
	IconClock,
	IconCoins,
	IconPackage,
	IconShoppingCart,
	IconTrendingUp,
} from "@tabler/icons-react";
import type { AnalyticsResponse } from "@/types";

interface AnalyticsOverviewStatsProps {
	data: AnalyticsResponse;
}

export function AnalyticsOverviewStats({ data }: AnalyticsOverviewStatsProps) {
	const stats = [
		{
			title: "Produits totaux",
			value: data.overview.totalProducts,
			icon: IconPackage,
			color: "text-blue-600",
			bgColor: "bg-blue-100",
		},
		{
			title: "Produits actifs",
			value: data.overview.activeProducts,
			icon: IconTrendingUp,
			color: "text-green-600",
			bgColor: "bg-green-100",
		},
		{
			title: "Ruptures de stock",
			value: data.overview.outOfStockProducts,
			icon: IconBan,
			color: "text-red-600",
			bgColor: "bg-red-100",
		},
		{
			title: "Stock faible",
			value: data.overview.lowStockProducts,
			icon: IconAlertTriangle,
			color: "text-orange-600",
			bgColor: "bg-orange-100",
		},
		{
			title: "Achats totaux",
			value: data.overview.totalPurchases,
			icon: IconShoppingCart,
			color: "text-purple-600",
			bgColor: "bg-purple-100",
		},
		{
			title: "En attente",
			value: data.overview.pendingClaims,
			icon: IconClock,
			color: "text-yellow-600",
			bgColor: "bg-yellow-100",
		},
		{
			title: "Points dépensés",
			value: data.overview.totalPointsSpent.toLocaleString(),
			icon: IconCoins,
			color: "text-orange-600",
			bgColor: "bg-orange-100",
		},
	];

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
			{stats.map((stat) => {
				const Icon = stat.icon;
				return (
					<Card key={stat.title}>
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-muted-foreground">
										{stat.title}
									</p>
									<p className="text-2xl font-bold">{stat.value}</p>
								</div>
								<div className={`p-3 rounded-full ${stat.bgColor}`}>
									<Icon className={`h-6 w-6 ${stat.color}`} />
								</div>
							</div>
						</CardContent>
					</Card>
				);
			})}
		</div>
	);
}
