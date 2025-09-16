import { IconShoppingBag } from "@tabler/icons-react";
import {
	createFileRoute,
	useNavigate,
	useRouter,
} from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import EmptyState from "@/components/marketplace/empty-state";
import ProductsGrid from "@/components/marketplace/products-grid";
import SchoolSelector from "@/components/marketplace/school-selector";
import ProductCreationModal from "@/features/marketplace/product-creation-modal";
import { tuyau } from "@/main";
import type { Product, School } from "@/types";

type SearchParams = {
	page?: number;
	limit?: number;
	schoolId?: string;
};

export const Route = createFileRoute("/_dashboard/marketplace")({
	component: SuperAdminMarketplace,
	validateSearch: (search: Record<string, unknown>): SearchParams => {
		return {
			page: Number(search.page) || 1,
			limit: Number(search.limit) || 10,
			schoolId: search.schoolId as string,
		};
	},
	loaderDeps: ({ search }) => ({
		page: search.page || 1,
		limit: search.limit || 10,
		schoolId: search.schoolId,
	}),
	loader: async ({ deps }) => {
		try {
			// Fetch schools first
			const schoolsResponse = await tuyau.schools.$get();

			let productsResponse = null;
			if (deps.schoolId) {
				// Fetch products for selected school
				productsResponse = await tuyau.marketplace
					.schools({ schoolId: deps.schoolId })
					.products.$get({
						query: {
							page: deps.page,
							limit: deps.limit,
						},
					});
			}

			return {
				schools: schoolsResponse.data?.schools || [],
				products: productsResponse?.data || null,
			};
		} catch (error) {
			console.error("Error loading marketplace data:", error);
			return {
				schools: [],
				products: null,
			};
		}
	},
});

function SuperAdminMarketplace() {
	const router = useRouter();
	const response = Route.useLoaderData();
	const { limit, schoolId } = Route.useSearch();
	const navigate = useNavigate();
	const [selectedSchoolId, setSelectedSchoolId] = useState<string>(
		schoolId || "",
	);
	const [deletingProduct, setDeletingProduct] = useState<string | undefined>(
		undefined,
	);
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [editingProduct, setEditingProduct] = useState<Product | null>(null);

	const schools = Array.isArray(response.schools) ? response.schools : [];
	const productsData = response.products;
	const products = productsData?.products || [];
	const meta = productsData?.meta;
	const currentLimit = limit || 10;

	const handleSchoolChange = (newSchoolId: string) => {
		setSelectedSchoolId(newSchoolId);
		navigate({
			to: "/marketplace",
			search: { page: 1, limit: currentLimit, schoolId: newSchoolId },
		});
	};

	const handlePageChange = (newPage: number) => {
		if (!selectedSchoolId) return;

		navigate({
			to: "/marketplace",
			search: {
				page: newPage,
				limit: currentLimit,
				schoolId: selectedSchoolId,
			},
		});
	};

	const handleLimitChange = (newLimit: number) => {
		if (!selectedSchoolId) return;

		navigate({
			to: "/marketplace",
			search: { page: 1, limit: newLimit, schoolId: selectedSchoolId },
		});
	};

	const handleDelete = async (productId: string) => {
		if (!selectedSchoolId) return;

		setDeletingProduct(productId);
		try {
			await tuyau.marketplace
				.schools({ schoolId: selectedSchoolId })
				.products({ id: productId })
				.$delete();
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

	const selectedSchool = schools.find(
		(school: School) => school.id === selectedSchoolId,
	);

	return (
		<div className="space-y-6">
			<div className="bg-white">
				<div className="container mx-auto py-8">
					<div className="flex justify-between items-center mb-8">
						<div>
							<h1 className="text-3xl font-bold flex items-center gap-3">
								<IconShoppingBag className="h-8 w-8 text-orange-600" />
								Marketplace Super Admin
							</h1>
							<p className="text-muted-foreground">
								Gérez les produits marketplace pour toutes les écoles
							</p>
						</div>
					</div>

					<SchoolSelector
						schools={schools}
						selectedSchoolId={selectedSchoolId}
						onSchoolChange={handleSchoolChange}
					/>

					{selectedSchoolId ? (
						<ProductsGrid
							products={products}
							meta={meta}
							selectedSchool={selectedSchool}
							deletingProduct={deletingProduct}
							currentLimit={currentLimit}
							onEdit={handleEdit}
							onDelete={handleDelete}
							onCreateClick={() => setIsCreateModalOpen(true)}
							onPageChange={handlePageChange}
							onLimitChange={handleLimitChange}
						/>
					) : (
						<EmptyState />
					)}
				</div>
			</div>

			{/* Product Creation Modal */}
			{selectedSchoolId && (
				<ProductCreationModal
					open={isCreateModalOpen}
					onOpenChange={setIsCreateModalOpen}
					schoolId={selectedSchoolId}
				/>
			)}

			{/* Product Edit Modal */}
			{selectedSchoolId && editingProduct && (
				<ProductCreationModal
					open={!!editingProduct}
					onOpenChange={(open) => !open && setEditingProduct(null)}
					product={editingProduct}
					schoolId={selectedSchoolId}
				/>
			)}
		</div>
	);
}
