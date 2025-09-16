import { Button, Card, CardContent, CardHeader, CardTitle } from "@klaz/ui";
import { IconPlus, IconShoppingBag } from "@tabler/icons-react";
import ProductCard from "@/components/marketplace/product-card";
import Pagination from "@/components/pagination/pagination";
import type { Product, ProductsResponse, School } from "@/types";

interface ProductsGridProps {
	products: Product[];
	meta: ProductsResponse["meta"];
	selectedSchool: School | undefined;
	deletingProduct: string | undefined;
	currentLimit: number;
	onEdit: (product: Product) => void;
	onDelete: (productId: string) => void;
	onCreateClick: () => void;
	onPageChange: (page: number) => void;
	onLimitChange: (limit: number) => void;
}

export default function ProductsGrid({
	products,
	meta,
	selectedSchool,
	deletingProduct,
	currentLimit,
	onEdit,
	onDelete,
	onCreateClick,
	onPageChange,
	onLimitChange,
}: ProductsGridProps) {
	return (
		<Card>
			<CardHeader>
				<div className="flex justify-between items-center">
					<CardTitle>
						Produits - {selectedSchool?.name} ({meta?.total || 0})
					</CardTitle>
					<Button onClick={onCreateClick}>
						<IconPlus className="mr-2 h-4 w-4" />
						Ajouter un produit
					</Button>
				</div>
			</CardHeader>
			<CardContent>
				{products.length > 0 ? (
					<>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{products.map((product: Product) => (
								<ProductCard
									key={product.id}
									product={product}
									onEdit={onEdit}
									onDelete={onDelete}
									isDeleting={deletingProduct === product.id}
								/>
							))}
						</div>

						{meta && (
							<div className="mt-8">
								<Pagination
									meta={meta}
									currentLimit={currentLimit}
									onPageChange={onPageChange}
									onLimitChange={onLimitChange}
								/>
							</div>
						)}
					</>
				) : (
					<div className="text-center py-12">
						<IconShoppingBag className="mx-auto h-12 w-12 text-gray-400 mb-4" />
						<h3 className="text-lg font-medium text-gray-900 mb-2">
							Aucun produit pour cette école
						</h3>
						<p className="text-gray-500 mb-4">
							Commencez par ajouter des produits au marketplace de cette école.
						</p>
						<Button onClick={onCreateClick}>
							<IconPlus className="mr-2 h-4 w-4" />
							Ajouter le premier produit
						</Button>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
