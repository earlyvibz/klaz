import {
	Button,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	Input,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@klaz/ui";
import { IconCoins, IconHistory, IconSearch } from "@tabler/icons-react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import Pagination from "@/components/pagination/pagination";
import Pending from "@/components/pending/pending";
import { StatusBadge } from "@/components/ui/status-badge";
import { tuyau } from "@/main";
import type {
	AdminPurchase,
	AdminPurchasesResponse,
	PurchasesSearchParams,
} from "@/types";

export const Route = createFileRoute("/_dashboard/admin/purchases")({
	component: AdminPurchases,
	validateSearch: (search: Record<string, unknown>): PurchasesSearchParams => {
		return {
			page: Number(search.page) || 1,
			limit: Number(search.limit) || 20,
			status: search.status ? String(search.status) : undefined,
			search: search.search ? String(search.search) : undefined,
		};
	},
	loaderDeps: ({ search }) => ({
		page: search.page || 1,
		limit: search.limit || 20,
		status: search.status,
		search: search.search,
	}),
	loader: async ({ deps }) => {
		const purchasesResponse = await tuyau.marketplace.purchases.$get({
			query: {
				page: deps.page,
				limit: deps.limit,
				...(deps.status && { status: deps.status }),
				...(deps.search && { search: deps.search }),
			},
		});

		return purchasesResponse;
	},
	pendingComponent: Pending,
});

function AdminPurchases() {
	const response = Route.useLoaderData();
	const { limit, status, search } = Route.useSearch();
	const navigate = useNavigate();
	const [searchTerm, setSearchTerm] = useState(search || "");

	if (response.error) {
		// @ts-ignore
		return <div>Erreur: {response.error.value?.errors?.[0]?.message}</div>;
	}

	const data = response.data as AdminPurchasesResponse;
	const purchases: AdminPurchase[] = data.purchases || [];
	const meta = data.meta;
	const currentLimit = limit || 20;

	const handlePageChange = (newPage: number) => {
		navigate({
			to: "/admin/purchases",
			search: { page: newPage, limit: currentLimit, status, search },
		});
	};

	const handleLimitChange = (newLimit: number) => {
		navigate({
			to: "/admin/purchases",
			search: { page: 1, limit: newLimit, status, search },
		});
	};

	const handleStatusFilter = (newStatus: string) => {
		navigate({
			to: "/admin/purchases",
			search: {
				page: 1,
				limit: currentLimit,
				status: newStatus === "all" ? undefined : newStatus,
				search,
			},
		});
	};

	const handleSearch = () => {
		navigate({
			to: "/admin/purchases",
			search: {
				page: 1,
				limit: currentLimit,
				status,
				search: searchTerm || undefined,
			},
		});
	};

	return (
		<div className="space-y-6">
			<div className="bg-white">
				<div className="container mx-auto py-1">
					<p className="text-muted-foreground">
						Consultez tous les achats effectués par les étudiants et leur statut
					</p>

					<Card className="mb-6">
						<CardHeader>
							<CardTitle>Filtres</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="flex gap-4 items-end">
								<div className="flex-1">
									<label
										htmlFor="search"
										className="block text-sm font-medium mb-2"
									>
										Rechercher par nom ou email
									</label>
									<div className="flex gap-2">
										<Input
											value={searchTerm}
											onChange={(e) => setSearchTerm(e.target.value)}
											placeholder="Nom d'utilisateur ou email..."
											onKeyDown={(e) => e.key === "Enter" && handleSearch()}
										/>
										<Button onClick={handleSearch}>
											<IconSearch className="h-4 w-4 mr-2" />
											Rechercher
										</Button>
									</div>
								</div>
								<div>
									<label
										htmlFor="status"
										className="block text-sm font-medium mb-2"
									>
										Statut
									</label>
									<Select
										value={status || "all"}
										onValueChange={handleStatusFilter}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="all">Tous</SelectItem>
											<SelectItem value="pending">En attente</SelectItem>
											<SelectItem value="claimed">Récupéré</SelectItem>
											<SelectItem value="cancelled">Annulé</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>
								Achats ({meta?.total || 0})
								{status && (
									<span className="ml-2 text-sm font-normal text-muted-foreground">
										- Filtrés par: {status}
									</span>
								)}
							</CardTitle>
						</CardHeader>
						<CardContent>
							{purchases.length > 0 ? (
								<>
									<div className="overflow-x-auto">
										<Table>
											<TableHeader>
												<TableRow>
													<TableHead>Produit</TableHead>
													<TableHead>Étudiant</TableHead>
													<TableHead>Statut</TableHead>
													<TableHead>Points</TableHead>
													<TableHead>Qté</TableHead>
													<TableHead>Date d'achat</TableHead>
													<TableHead>Date de récupération</TableHead>
												</TableRow>
											</TableHeader>
											<TableBody>
												{purchases.map((purchase) => (
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
																		<span className="text-gray-500 text-xs">
																			N/A
																		</span>
																	</div>
																)}
																<div>
																	<p className="font-medium">
																		{purchase.product.title}
																	</p>
																	<p className="text-sm text-muted-foreground line-clamp-1">
																		{purchase.product.description}
																	</p>
																</div>
															</div>
														</TableCell>
														<TableCell>
															<div>
																<p className="font-medium">
																	{purchase.user?.firstName || "N/A"}{" "}
																	{purchase.user?.lastName || ""}
																</p>
																<p className="text-sm text-muted-foreground">
																	{purchase.user?.email ||
																		"Email non disponible"}
																</p>
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
																: "-"}
														</TableCell>
														<TableCell className="text-sm text-muted-foreground">
															{purchase.claimedAt
																? new Date(
																		purchase.claimedAt,
																	).toLocaleDateString("fr-FR", {
																		day: "numeric",
																		month: "short",
																		year: "numeric",
																		hour: "2-digit",
																		minute: "2-digit",
																	})
																: "-"}
														</TableCell>
													</TableRow>
												))}
											</TableBody>
										</Table>
									</div>

									{meta && (
										<div className="mt-8">
											<Pagination
												meta={meta}
												currentLimit={currentLimit}
												onPageChange={handlePageChange}
												onLimitChange={handleLimitChange}
											/>
										</div>
									)}
								</>
							) : (
								<div className="text-center py-12">
									<IconHistory className="mx-auto h-12 w-12 text-gray-400 mb-4" />
									<h3 className="text-lg font-medium text-gray-900 mb-2">
										Aucun achat trouvé
									</h3>
									<p className="text-gray-500">
										{status || search
											? "Aucun achat ne correspond aux critères de recherche."
											: "Aucun achat n'a été effectué pour le moment."}
									</p>
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
