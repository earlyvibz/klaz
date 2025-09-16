import { Button, Card, CardContent } from "@klaz/ui";
import Spinner from "@/components/spinner/spinner";
import type { Product } from "@/types";

interface ProductCardProps {
	product: Product;
	onEdit: (product: Product) => void;
	onDelete: (productId: string) => void;
	isDeleting: boolean;
}

export default function ProductCard({
	product,
	onEdit,
	onDelete,
	isDeleting,
}: ProductCardProps) {
	return (
		<Card className="overflow-hidden">
			<div className="p-0">
				{product.image ? (
					<img
						src={product.image}
						alt={product.title}
						className="w-full h-48 object-contain"
					/>
				) : (
					<div className="w-full h-48 bg-gray-200 flex items-center justify-center">
						<span className="text-gray-500">Pas d'image</span>
					</div>
				)}
			</div>
			<CardContent className="p-4">
				<h3 className="font-semibold text-lg mb-2">{product.title}</h3>
				<p className="text-sm text-muted-foreground mb-4 line-clamp-2">
					{product.description || "Aucune description"}
				</p>
				<div className="flex justify-between items-center mb-4">
					<div className="text-orange-600 font-semibold">
						{product.pricePoints} points
					</div>
					<div className="text-sm text-muted-foreground">
						Stock: {product.supply}
					</div>
				</div>
				<div className="flex gap-2">
					<Button
						variant="outline"
						size="sm"
						className="flex-1"
						onClick={() => onEdit(product)}
					>
						Modifier
					</Button>
					<Button
						variant="destructive"
						size="sm"
						onClick={() => onDelete(product.id)}
						disabled={isDeleting}
					>
						{isDeleting ? <Spinner /> : "Supprimer"}
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
