import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@klaz/ui";
import { IconCoins, IconPackage, IconShoppingBag } from "@tabler/icons-react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import Pagination from "@/components/pagination/pagination";
import Pending from "@/components/pending/pending";
import { StatusBadge } from "@/components/ui/status-badge";
import { tuyau } from "@/main";
import type {
	PaginationSearchParams,
	PurchaseHistory,
	PurchaseHistoryResponse,
} from "@/types";

export const Route = createFileRoute("/_dashboard/my-purchases")({
	component: MyPurchases,
	validateSearch: (search: Record<string, unknown>): PaginationSearchParams => {
		return {
			page: Number(search.page) || 1,
			limit: Number(search.limit) || 10,
		};
	},
	loaderDeps: ({ search }) => ({
		page: search.page || 1,
		limit: search.limit || 10,
	}),
	loader: async ({ deps }) => {
		const purchasesResponse = await tuyau.marketplace.mypurchases.$get({
			query: {
				page: deps.page,
				limit: deps.limit,
			},
		});

		return purchasesResponse;
	},
	pendingComponent: Pending,
});

function getStatusMessage(status: string) {
	switch (status) {
		case "pending":
			return "Rendez-vous au bureau administratif pour récupérer votre produit.";
		case "claimed":
			return "Produit récupéré avec succès.";
		case "cancelled":
			return "Achat annulé, vos points ont été remboursés.";
		default:
			return "";
	}
}

function MyPurchases() {
	const response = Route.useLoaderData();
	const { limit } = Route.useSearch();
	const navigate = useNavigate();

	if (response.error) {
		// @ts-ignore
		return <div>Erreur: {response.error.value.errors[0].message}</div>;
	}

	const data = response.data as PurchaseHistoryResponse;
	const purchases = data.purchases || [];
	const currentLimit = limit || 10;

	const handlePageChange = (newPage: number) => {
		navigate({
			to: "/my-purchases",
			search: { page: newPage, limit: currentLimit },
		});
	};

	const handleLimitChange = (newLimit: number) => {
		navigate({
			to: "/my-purchases",
			search: { page: 1, limit: newLimit },
		});
	};

	return (
		<div className="space-y-6">
			<div className="bg-white">
				<div className="container mx-auto py-8">
					<div className="mb-8">
						<h1 className="text-3xl font-bold flex items-center gap-3">
							<IconShoppingBag className="h-8 w-8 text-orange-600" />
							Mes achats
						</h1>
						<p className="text-muted-foreground">
							Consultez l'historique de vos achats dans le marketplace et suivez
							le statut de récupération
						</p>
					</div>

					<Card>
						<CardHeader>
							<CardTitle>Mes achats ({data.meta?.total || 0})</CardTitle>
						</CardHeader>
						<CardContent>
							{purchases.length > 0 ? (
								<>
									<div className="overflow-x-auto">
										<Table>
											<TableHeader>
												<TableRow>
													<TableHead>Produit</TableHead>
													<TableHead>Statut</TableHead>
													<TableHead>Points</TableHead>
													<TableHead>Qté</TableHead>
													<TableHead>Date d'achat</TableHead>
													<TableHead>Instructions</TableHead>
												</TableRow>
											</TableHeader>
											<TableBody>
												{purchases.map((purchase: PurchaseHistory) => (
													<TableRow key={purchase.id}>
														<TableCell>
															<div className="flex items-center gap-3">
																{purchase.product.image ? (
																	<img
																		src={purchase.product.image}
																		alt={purchase.product.title}
																		className="w-12 h-12 object-cover rounded-md"
																	/>
																) : (
																	<div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center">
																		<IconPackage className="h-6 w-6 text-gray-500" />
																	</div>
																)}
																<div>
																	<p className="font-medium">
																		{purchase.product.title}
																	</p>
																	<p className="text-sm text-muted-foreground line-clamp-1">
																		{purchase.product.description ||
																			"Aucune description"}
																	</p>
																</div>
															</div>
														</TableCell>
														<TableCell>
															<StatusBadge status={purchase.status} />
														</TableCell>
														<TableCell>
															<div className="flex items-center gap-1 text-orange-600 font-semibold">
																<IconCoins className="h-4 w-4" />
																{purchase.totalPoints}
															</div>
														</TableCell>
														<TableCell>{purchase.quantity}</TableCell>
														<TableCell className="text-sm text-muted-foreground">
															{purchase.createdAt
																? new Date(
																		purchase.createdAt,
																	).toLocaleDateString("fr-FR", {
																		day: "numeric",
																		month: "short",
																		year: "numeric",
																		hour: "2-digit",
																		minute: "2-digit",
																	})
																: "Date inconnue"}
														</TableCell>
														<TableCell className="text-sm">
															{getStatusMessage(purchase.status) && (
																<div className="bg-blue-50 border border-blue-200 rounded-md p-2">
																	<p className="text-xs text-blue-800">
																		{getStatusMessage(purchase.status)}
																	</p>
																</div>
															)}
														</TableCell>
													</TableRow>
												))}
											</TableBody>
										</Table>
									</div>

									{data.meta && (
										<div className="mt-8">
											<Pagination
												meta={data.meta}
												currentLimit={currentLimit}
												onPageChange={handlePageChange}
												onLimitChange={handleLimitChange}
											/>
										</div>
									)}
								</>
							) : (
								<div className="text-center py-12">
									<IconShoppingBag className="mx-auto h-12 w-12 text-gray-400 mb-4" />
									<h3 className="text-lg font-medium text-gray-900 mb-2">
										Aucun achat pour le moment
									</h3>
									<p className="text-gray-500 mb-4">
										Vous n'avez pas encore effectué d'achat dans le marketplace.
									</p>
									<a
										href="/marketplace"
										className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700"
									>
										Découvrir le marketplace
									</a>
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
