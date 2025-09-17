import {
	Badge,
	Button,
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
	Input,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@klaz/ui";
import {
	IconAlertTriangle,
	IconBan,
	IconCoins,
	IconSearch,
	IconShoppingCart,
	IconX,
} from "@tabler/icons-react";
import {
	createFileRoute,
	useNavigate,
	useRouter,
} from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import Pagination from "@/components/pagination/pagination";
import Pending from "@/components/pending/pending";
import PurchaseConfirmationModal from "@/features/students/marketplace/purchase-confirmation-modal";
import { tuyau } from "@/main";
import useAuth from "@/stores/auth-store";
import type {
	MarketplaceSearchParams,
	Product,
	ProductsResponse,
} from "@/types";

export const Route = createFileRoute("/_dashboard/marketplace")({
	component: Marketplace,
	validateSearch: (
		search: Record<string, unknown>,
	): MarketplaceSearchParams => {
		return {
			page: Number(search.page) || 1,
			limit: Number(search.limit) || 12,
			search: String(search.search || ""),
			sortBy: String(search.sortBy || "created_at"),
			sortOrder: String(search.sortOrder || "desc"),
			minPrice: search.minPrice ? Number(search.minPrice) : undefined,
			maxPrice: search.maxPrice ? Number(search.maxPrice) : undefined,
			inStock: search.inStock === "true" ? true : undefined,
		};
	},
	loaderDeps: ({ search }) => ({
		page: search.page || 1,
		limit: search.limit || 12,
		search: search.search || "",
		sortBy: search.sortBy || "created_at",
		sortOrder: search.sortOrder || "desc",
		minPrice: search.minPrice,
		maxPrice: search.maxPrice,
		inStock: search.inStock,
	}),
	loader: async ({ deps }) => {
		const queryParams: Record<string, string | number | boolean> = {
			page: deps.page,
			limit: deps.limit,
		};

		// Add search params only if they have values
		if (deps.search) queryParams.search = deps.search;
		if (deps.sortBy) queryParams.sortBy = deps.sortBy;
		if (deps.sortOrder) queryParams.sortOrder = deps.sortOrder;
		if (deps.minPrice) queryParams.minPrice = deps.minPrice;
		if (deps.maxPrice) queryParams.maxPrice = deps.maxPrice;
		if (deps.inStock) queryParams.inStock = deps.inStock;

		const productsResponse = await tuyau.marketplace.products.$get({
			query: queryParams,
		});

		return productsResponse;
	},
	// Add stale time for better caching
	staleTime: 1000 * 60 * 2, // 2 minutes for authenticated users
	gcTime: 1000 * 60 * 5, // 5 minutes garbage collection
	pendingComponent: Pending,
});

function Marketplace() {
	const router = useRouter();
	const response = Route.useLoaderData();
	const { limit, search, sortBy, sortOrder, minPrice, maxPrice, inStock } =
		Route.useSearch();
	const navigate = useNavigate();
	const { user } = useAuth();
	const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
	const [searchInput, setSearchInput] = useState(search || "");

	if (response.error) {
		// @ts-ignore
		return <div>Erreur: {response.error.value.errors[0].message}</div>;
	}

	const data = response.data as ProductsResponse;
	const products = data.products || [];
	const currentLimit = limit || 12;

	const handlePageChange = (newPage: number) => {
		navigate({
			to: "/marketplace",
			search: {
				page: newPage,
				limit: currentLimit,
				search,
				sortBy,
				sortOrder,
				minPrice,
				maxPrice,
				inStock,
			},
		});
	};

	const handleLimitChange = (newLimit: number) => {
		navigate({
			to: "/marketplace",
			search: {
				page: 1,
				limit: newLimit,
				search,
				sortBy,
				sortOrder,
				minPrice,
				maxPrice,
				inStock,
			},
		});
	};

	// Manual search (when pressing Enter or search button)
	const handleSearch = () => {
		navigate({
			to: "/marketplace",
			search: {
				page: 1,
				limit: currentLimit,
				search: searchInput,
				sortBy,
				sortOrder,
				minPrice,
				maxPrice,
				inStock,
			},
		});
	};

	const clearFilters = () => {
		setSearchInput("");
		navigate({
			to: "/marketplace",
			search: { page: 1, limit: currentLimit },
		});
	};

	const hasActiveFilters =
		search || sortBy !== "created_at" || sortOrder !== "desc" || inStock;

	const getStockStatus = (supply: number) => {
		if (supply === 0) {
			return {
				status: "out-of-stock" as const,
				label: "Rupture de stock",
				variant: "destructive" as const,
				icon: IconBan,
			};
		} else if (supply <= 5) {
			return {
				status: "low-stock" as const,
				label: `Plus que ${supply}`,
				variant: "outline" as const,
				icon: IconAlertTriangle,
				className: "border-orange-500 text-orange-700",
			};
		} else {
			return {
				status: "in-stock" as const,
				label: `Stock: ${supply}`,
				variant: "secondary" as const,
				icon: null,
			};
		}
	};

	const handlePurchaseClick = (product: Product) => {
		if (!user) return;

		if (user.points < product.pricePoints) {
			toast.error("Vous n'avez pas assez de points pour acheter ce produit");
			return;
		}

		setSelectedProduct(product);
	};

	const handlePurchaseSuccess = () => {
		router.invalidate();
	};

	const handleCloseModal = () => {
		setSelectedProduct(null);
	};

	return (
		<div className="space-y-6">
			<div className="bg-white">
				<div className="container mx-auto py-8">
					<div className="mb-8">
						<div className="flex justify-between items-center">
							<div>
								<h1 className="text-3xl font-bold">Marketplace</h1>
								<p className="text-muted-foreground">
									Échangez vos points contre des produits exclusifs
								</p>
							</div>
							{user && (
								<div className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-6 py-3 rounded-lg">
									<div className="flex items-center gap-2">
										<IconCoins className="h-5 w-5" />
										<span className="font-semibold">
											{user.points.toLocaleString()} points
										</span>
									</div>
								</div>
							)}
						</div>
					</div>

					{/* Search and Filters */}
					<div className="mb-6">
						<div className="flex flex-col sm:flex-row gap-4">
							{/* Search Bar */}
							<div className="flex-1 relative">
								<IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
								<Input
									placeholder="Rechercher des produits..."
									value={searchInput}
									onChange={(e) => setSearchInput(e.target.value)}
									onKeyDown={(e) => e.key === "Enter" && handleSearch()}
									className="pl-10"
								/>
							</div>

							{/* Sort Order */}
							<Select
								value={`${sortBy || "created_at"}-${sortOrder || "desc"}`}
								onValueChange={(value) => {
									const [newSortBy, newSortOrder] = value.split("-");
									navigate({
										to: "/marketplace",
										search: {
											page: 1,
											limit: currentLimit,
											search,
											sortBy: newSortBy,
											sortOrder: newSortOrder,
											minPrice,
											maxPrice,
											inStock,
										},
									});
								}}
							>
								<SelectTrigger className="w-full sm:w-48">
									<SelectValue placeholder="Trier par" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="created_at-desc">Plus récents</SelectItem>
									<SelectItem value="created_at-asc">Plus anciens</SelectItem>
									<SelectItem value="title-asc">Nom A-Z</SelectItem>
									<SelectItem value="title-desc">Nom Z-A</SelectItem>
									<SelectItem value="price_points-asc">
										Prix croissant
									</SelectItem>
									<SelectItem value="price_points-desc">
										Prix décroissant
									</SelectItem>
								</SelectContent>
							</Select>

							{/* Clear Filters */}
							{hasActiveFilters && (
								<Button onClick={clearFilters} variant="outline" size="icon">
									<IconX className="h-4 w-4" />
								</Button>
							)}
						</div>
					</div>

					{products.length > 0 ? (
						<>
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
								{products.map((product: Product) => (
									<Card
										key={product.id}
										className="overflow-hidden flex flex-col h-full"
									>
										<CardHeader className="p-0">
											{product.image ? (
												<img
													src={product.image}
													alt={product.title}
													className="w-full h-48 object-contain"
													loading="lazy"
													decoding="async"
													onError={(e) => {
														e.currentTarget.style.display = "none";
														e.currentTarget.nextElementSibling?.classList.remove(
															"hidden",
														);
													}}
												/>
											) : null}
											<div
												className={`w-full h-48 bg-gray-200 flex items-center justify-center ${product.image ? "hidden" : ""}`}
											>
												<span className="text-gray-500">Pas d'image</span>
											</div>
										</CardHeader>
										<CardContent className="p-4 flex-1 flex flex-col">
											<div className="flex items-start justify-between mb-2">
												<CardTitle className="text-lg flex-1">
													{product.title}
												</CardTitle>
												{(() => {
													const stockStatus = getStockStatus(product.supply);
													if (stockStatus.status !== "in-stock") {
														const Icon = stockStatus.icon;
														return (
															<Badge
																variant={stockStatus.variant}
																className={`ml-2 ${stockStatus.className || ""}`}
															>
																{Icon && <Icon className="h-3 w-3 mr-1" />}
																{stockStatus.label}
															</Badge>
														);
													}
													return null;
												})()}
											</div>
											<p className="text-sm text-muted-foreground mb-2 flex-1 line-clamp-3">
												{product.description || "Aucune description"}
											</p>
											{product.maxQuantityPerStudent && (
												<div className="text-xs mb-2">
													{product.hasReachedLimit ? (
														<p className="text-red-600 font-medium">
															Limite atteinte ({product.userPurchaseCount}/
															{product.maxQuantityPerStudent})
														</p>
													) : (
														<p className="text-blue-600">
															Limite: {product.maxQuantityPerStudent} par
															étudiant ({product.userPurchaseCount || 0}/
															{product.maxQuantityPerStudent})
														</p>
													)}
												</div>
											)}
											<div className="flex items-center justify-between mt-auto">
												<div className="flex items-center gap-1 text-orange-600 font-semibold">
													<IconCoins className="h-4 w-4" />
													{product.pricePoints} points
												</div>
												<div className="text-sm text-muted-foreground">
													{getStockStatus(product.supply).label}
												</div>
											</div>
										</CardContent>
										<CardFooter className="p-4 pt-0">
											<Button
												onClick={() => handlePurchaseClick(product)}
												disabled={
													!!(
														product.supply === 0 ||
														!product.isActive ||
														(user && user.points < product.pricePoints) ||
														product.hasReachedLimit
													)
												}
												className="w-full"
											>
												<IconShoppingCart className="mr-2 h-4 w-4" />
												{product.supply === 0
													? "Rupture de stock"
													: !product.isActive
														? "Indisponible"
														: product.hasReachedLimit
															? "Limite atteinte"
															: user && user.points < product.pricePoints
																? "Points insuffisants"
																: "Acheter"}
											</Button>
										</CardFooter>
									</Card>
								))}
							</div>

							<div className="mt-8">
								<Pagination
									meta={data.meta}
									currentLimit={currentLimit}
									onPageChange={handlePageChange}
									onLimitChange={handleLimitChange}
								/>
							</div>
						</>
					) : (
						<div className="text-center py-12">
							<IconShoppingCart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
							<h3 className="text-lg font-medium text-gray-900 mb-2">
								Aucun produit disponible
							</h3>
							<p className="text-gray-500">
								Revenez plus tard pour découvrir de nouveaux produits !
							</p>
						</div>
					)}
				</div>
			</div>

			<PurchaseConfirmationModal
				product={selectedProduct}
				onClose={handleCloseModal}
				onPurchaseSuccess={handlePurchaseSuccess}
			/>
		</div>
	);
}
