import { Button, Card, CardContent, CardHeader, CardTitle } from "@klaz/ui";
import { IconPlus } from "@tabler/icons-react";
import {
	createFileRoute,
	useNavigate,
	useRouter,
} from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import Pagination from "@/components/pagination/pagination";
import Pending from "@/components/pending/pending";
import TableProducts from "@/components/tables/table-products";
import ProductCreationModal from "@/features/admin/marketplace/product-creation-modal";
import { tuyau } from "@/main";
import type {
	PaginationSearchParams,
	Product,
	ProductsResponse,
} from "@/types";

export const Route = createFileRoute("/_dashboard/admin/marketplace")({
	component: AdminMarketplace,
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
		const productsResponse = await tuyau.marketplace.products.admin.$get({
			query: {
				page: deps.page,
				limit: deps.limit,
			},
		});

		return productsResponse;
	},
	pendingComponent: Pending,
});

function AdminMarketplace() {
	const router = useRouter();
	const response = Route.useLoaderData();
	const { limit } = Route.useSearch();
	const navigate = useNavigate();
	const [deletingProduct, setDeletingProduct] = useState<string | undefined>(
		undefined,
	);
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [editingProduct, setEditingProduct] = useState<Product | undefined>(
		undefined,
	);

	if (response.error) {
		// @ts-ignore
		return <div>Erreur: {response.error.value.errors[0].message}</div>;
	}

	const data = response.data as ProductsResponse;
	const currentLimit = limit || 10;

	const handlePageChange = (newPage: number) => {
		navigate({
			to: "/admin/marketplace",
			search: { page: newPage, limit: currentLimit },
		});
	};

	const handleLimitChange = (newLimit: number) => {
		navigate({
			to: "/admin/marketplace",
			search: { page: 1, limit: newLimit },
		});
	};

	const handleDelete = async (productId: string) => {
		setDeletingProduct(productId);
		try {
			await tuyau.marketplace.products({ id: productId }).$delete();
			toast.success("Produit supprimé avec succès");

			router.invalidate();
		} catch (error) {
			console.error("Erreur lors de la suppression:", error);
			toast.error("Erreur lors de la suppression du produit");
		} finally {
			setDeletingProduct(undefined);
		}
	};

	const handleEdit = (product: Product) => {
		setEditingProduct(product);
	};

	return (
		<div className="space-y-6">
			<div className="bg-white">
				<div className="container mx-auto py-8">
					<div className="flex justify-between items-center mb-8">
						<div>
							<h1 className="text-3xl font-bold">Marketplace Admin</h1>
							<p className="text-muted-foreground">
								Gérez les produits disponibles dans le marketplace
							</p>
						</div>
						<Button onClick={() => setIsCreateModalOpen(true)}>
							<IconPlus className="mr-2 h-4 w-4" />
							Ajouter un produit
						</Button>
					</div>

					<Card>
						<CardHeader>
							<CardTitle>Produits ({data.meta.total})</CardTitle>
						</CardHeader>
						<CardContent>
							<TableProducts
								products={data.products}
								onDelete={handleDelete}
								onEdit={handleEdit}
								isDeleting={deletingProduct}
							/>
						</CardContent>
					</Card>
				</div>

				<Pagination
					meta={data.meta}
					currentLimit={currentLimit}
					onPageChange={handlePageChange}
					onLimitChange={handleLimitChange}
				/>
			</div>

			<ProductCreationModal
				open={isCreateModalOpen}
				onOpenChange={setIsCreateModalOpen}
			/>

			<ProductCreationModal
				open={!!editingProduct}
				onOpenChange={(open) => !open && setEditingProduct(undefined)}
				product={editingProduct}
			/>
		</div>
	);
}
