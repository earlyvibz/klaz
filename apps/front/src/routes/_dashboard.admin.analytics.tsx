import { createFileRoute } from "@tanstack/react-router";
import Pending from "@/components/pending/pending";
import { AnalyticsOverviewStats } from "@/features/admin/analytics/analytics-overview-stats";
import { AnalyticsQuickActions } from "@/features/admin/analytics/analytics-quick-actions";
import { AnalyticsRecentPurchases } from "@/features/admin/analytics/analytics-recent-purchases";
import { AnalyticsTopProducts } from "@/features/admin/analytics/analytics-top-products";
import { tuyau } from "@/main";
import type { AnalyticsResponse } from "@/types";

export const Route = createFileRoute("/_dashboard/admin/analytics")({
	component: Analytics,
	loader: async () => {
		const analyticsResponse = await tuyau.marketplace.analytics.$get();
		return analyticsResponse;
	},
	pendingComponent: Pending,
});

function Analytics() {
	const response = Route.useLoaderData();

	if (response.error) {
		return (
			<div>
				Erreur: Une erreur est survenue lors du chargement des analytics
			</div>
		);
	}

	const data = response.data as AnalyticsResponse;

	return (
		<div className="space-y-6">
			<div className="bg-white">
				<div className="container mx-auto py-8">
					<div className="mb-8">
						<h1 className="text-3xl font-bold">Analytics Marketplace</h1>
						<p className="text-muted-foreground">
							Vue d'ensemble des performances de votre marketplace
						</p>
					</div>

					<AnalyticsOverviewStats data={data} />

					<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
						<AnalyticsTopProducts data={data} />
						<AnalyticsRecentPurchases data={data} />
					</div>

					<AnalyticsQuickActions data={data} />
				</div>
			</div>
		</div>
	);
}
