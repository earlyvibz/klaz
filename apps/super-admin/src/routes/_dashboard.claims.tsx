import {
	Button,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	Pending,
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
import { IconClipboardCheck, IconCoins } from "@tabler/icons-react";
import {
	createFileRoute,
	useNavigate,
	useRouter,
} from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import Pagination from "@/components/pagination/pagination";
import { tuyau } from "@/main";
import type { Claim, ClaimsResponse, School } from "@/types";

type SearchParams = {
	schoolId?: string;
	page?: number;
	limit?: number;
};

export const Route = createFileRoute("/_dashboard/claims")({
	component: SuperAdminClaims,
	validateSearch: (search: Record<string, unknown>): SearchParams => {
		return {
			schoolId: search.schoolId ? String(search.schoolId) : undefined,
			page: Number(search.page) || 1,
			limit: Number(search.limit) || 10,
		};
	},
	loaderDeps: ({ search }) => ({
		schoolId: search.schoolId,
		page: search.page || 1,
		limit: search.limit || 10,
	}),
	loader: async ({ deps }) => {
		const schoolsResponse = await tuyau.schools.$get({
			query: { page: 1, limit: 100 },
		});

		let claimsResponse = null;
		if (deps.schoolId) {
			claimsResponse = await tuyau.marketplace
				.schools({ schoolId: deps.schoolId })
				.claims.$get({
					query: {
						page: deps.page,
						limit: deps.limit,
					},
				});
		}

		return {
			schools: schoolsResponse.data?.schools || [],
			claims: claimsResponse,
		};
	},
	pendingComponent: Pending,
});

function SuperAdminClaims() {
	const router = useRouter();
	const loaderData = Route.useLoaderData();
	const { schoolId, limit } = Route.useSearch();
	const navigate = useNavigate();
	const [processingClaim, setProcessingClaim] = useState<string | undefined>(
		undefined,
	);

	const schools = Array.isArray(loaderData.schools) ? loaderData.schools : [];
	const selectedSchool = schools.find(
		(school: School) => school.id === schoolId,
	);

	let claims: Claim[] = [];
	let meta: ClaimsResponse["meta"] | null = null;

	if (loaderData.claims && !loaderData.claims.error) {
		const claimsData = loaderData.claims.data as ClaimsResponse;
		claims = claimsData.purchases || [];
		meta = claimsData.meta;
	}

	const currentLimit = limit || 10;

	const handleSchoolChange = (newSchoolId: string) => {
		navigate({
			to: "/claims",
			search: { schoolId: newSchoolId, page: 1, limit: currentLimit },
		});
	};

	const handlePageChange = (newPage: number) => {
		navigate({
			to: "/claims",
			search: { schoolId, page: newPage, limit: currentLimit },
		});
	};

	const handleLimitChange = (newLimit: number) => {
		navigate({
			to: "/claims",
			search: { schoolId, page: 1, limit: newLimit },
		});
	};

	const handleClaimPurchase = async (claimId: string) => {
		if (!schoolId) return;

		setProcessingClaim(claimId);
		try {
			await tuyau.marketplace
				.schools({ schoolId })
				.claims({ id: claimId })
				.claim.$post({});
			toast.success("Réclamation marquée comme récupérée");
			router.invalidate();
		} catch (error) {
			console.error("Erreur lors de la validation:", error);
			toast.error("Erreur lors de la validation de la réclamation");
		} finally {
			setProcessingClaim(undefined);
		}
	};

	const handleCancelPurchase = async (claimId: string) => {
		if (!schoolId) return;

		setProcessingClaim(claimId);
		try {
			await tuyau.marketplace
				.schools({ schoolId })
				.claims({ id: claimId })
				.cancel.$post({});
			toast.success("Réclamation annulée et points remboursés");
			router.invalidate();
		} catch (error) {
			console.error("Erreur lors de l'annulation:", error);
			toast.error("Erreur lors de l'annulation de la réclamation");
		} finally {
			setProcessingClaim(undefined);
		}
	};

	return (
		<div className="space-y-6">
			<div className="bg-white">
				<div className="container mx-auto py-8">
					<div className="mb-8">
						<h1 className="text-3xl font-bold flex items-center gap-3">
							<IconClipboardCheck className="h-8 w-8 text-blue-600" />
							Réclamations en attente
						</h1>
						<p className="text-muted-foreground">
							Gérez les demandes de récupération de produits des étudiants par
							école
						</p>
					</div>

					<Card className="mb-6">
						<CardHeader>
							<CardTitle>Sélection de l'école</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="max-w-md">
								<Select
									value={schoolId || ""}
									onValueChange={handleSchoolChange}
								>
									<SelectTrigger>
										<SelectValue placeholder="Choisissez une école" />
									</SelectTrigger>
									<SelectContent>
										{schools.map((school: School) => (
											<SelectItem key={school.id} value={school.id}>
												{school.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</CardContent>
					</Card>

					{selectedSchool ? (
						<Card>
							<CardHeader>
								<CardTitle>
									Réclamations - {selectedSchool.name} ({meta?.total || 0})
								</CardTitle>
							</CardHeader>
							<CardContent>
								{claims.length > 0 ? (
									<>
										<Table>
											<TableHeader>
												<TableRow>
													<TableHead>Produit</TableHead>
													<TableHead>Étudiant</TableHead>
													<TableHead>Date d'achat</TableHead>
													<TableHead className="text-right">Points</TableHead>
													<TableHead className="text-right">Quantité</TableHead>
													<TableHead className="text-center">Actions</TableHead>
												</TableRow>
											</TableHeader>
											<TableBody>
												{claims.map((claim) => (
													<TableRow key={claim.id}>
														<TableCell>
															<div className="flex items-center gap-3">
																{claim.product.image ? (
																	<img
																		src={claim.product.image}
																		alt={claim.product.title}
																		className="w-12 h-12 object-cover rounded-md flex-shrink-0"
																	/>
																) : (
																	<div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center flex-shrink-0">
																		<span className="text-gray-500 text-xs">
																			N/A
																		</span>
																	</div>
																)}
																<div>
																	<div className="font-semibold">
																		{claim.product.title}
																	</div>
																	<div className="text-sm text-muted-foreground line-clamp-1">
																		{claim.product.description}
																	</div>
																</div>
															</div>
														</TableCell>
														<TableCell>
															<div>
																<div className="font-medium">
																	{claim.user?.firstName || "N/A"}{" "}
																	{claim.user?.lastName || ""}
																</div>
																<div className="text-sm text-muted-foreground">
																	{claim.user?.email || "Email non disponible"}
																</div>
															</div>
														</TableCell>
														<TableCell>
															<div className="text-sm">
																{claim.createdAt
																	? new Date(
																			claim.createdAt,
																		).toLocaleDateString("fr-FR", {
																			day: "numeric",
																			month: "short",
																			year: "numeric",
																			hour: "2-digit",
																			minute: "2-digit",
																		})
																	: "Date inconnue"}
															</div>
														</TableCell>
														<TableCell className="text-right">
															<div className="flex items-center justify-end gap-1 text-orange-600 font-semibold">
																<IconCoins className="h-4 w-4" />
																{claim.totalPoints}
															</div>
														</TableCell>
														<TableCell className="text-right">
															{claim.quantity}
														</TableCell>
														<TableCell className="text-center">
															<div className="flex gap-2 justify-center">
																<Button
																	size="sm"
																	onClick={() => handleClaimPurchase(claim.id)}
																	disabled={processingClaim === claim.id}
																>
																	{processingClaim === claim.id
																		? "..."
																		: "Récupéré"}
																</Button>
																<Button
																	size="sm"
																	variant="destructive"
																	onClick={() => handleCancelPurchase(claim.id)}
																	disabled={processingClaim === claim.id}
																>
																	{processingClaim === claim.id
																		? "..."
																		: "Annuler"}
																</Button>
															</div>
														</TableCell>
													</TableRow>
												))}
											</TableBody>
										</Table>

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
										<IconClipboardCheck className="mx-auto h-12 w-12 text-gray-400 mb-4" />
										<h3 className="text-lg font-medium text-gray-900 mb-2">
											Aucune réclamation en attente
										</h3>
										<p className="text-gray-500">
											Toutes les réclamations ont été traitées pour cette école
											ou il n'y en a aucune pour le moment.
										</p>
									</div>
								)}
							</CardContent>
						</Card>
					) : (
						<Card>
							<CardContent className="text-center py-12">
								<IconClipboardCheck className="mx-auto h-12 w-12 text-gray-400 mb-4" />
								<h3 className="text-lg font-medium text-gray-900 mb-2">
									Sélectionnez une école
								</h3>
								<p className="text-gray-500">
									Choisissez une école dans la liste ci-dessus pour voir les
									réclamations en attente.
								</p>
							</CardContent>
						</Card>
					)}
				</div>
			</div>
		</div>
	);
}
