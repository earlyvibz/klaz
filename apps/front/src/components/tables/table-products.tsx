import {
	Badge,
	Button,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@klaz/ui";
import {
	IconAlertTriangle,
	IconBan,
	IconEdit,
	IconTrash,
} from "@tabler/icons-react";
import type { Product } from "@/types";

interface TableProductsProps {
	products: Product[];
	onDelete: (productId: string) => void;
	onEdit: (product: Product) => void;
	isDeleting?: string;
}

export default function TableProducts({
	products,
	onDelete,
	onEdit,
	isDeleting,
}: TableProductsProps) {
	const getStockStatus = (supply: number) => {
		if (supply === 0) {
			return {
				status: "out-of-stock",
				label: "Rupture de stock",
				variant: "destructive" as const,
				icon: IconBan,
			};
		} else if (supply <= 5) {
			return {
				status: "low-stock",
				label: `Stock faible (${supply})`,
				variant: "outline" as const,
				icon: IconAlertTriangle,
				className: "border-orange-500 text-orange-700",
			};
		} else {
			return {
				status: "in-stock",
				label: `${supply} en stock`,
				variant: "secondary" as const,
				icon: null,
			};
		}
	};
	return (
		<Table className="text-center">
			<TableHeader className="bg-muted sticky top-0 z-10">
				<TableRow>
					<TableHead className="text-center">Image</TableHead>
					<TableHead className="text-center">Titre</TableHead>
					<TableHead className="text-center">Description</TableHead>
					<TableHead className="text-center">Prix (points)</TableHead>
					<TableHead className="text-center">Stock</TableHead>
					<TableHead className="text-center">Limite/étudiant</TableHead>
					<TableHead className="text-center">Statut</TableHead>
					<TableHead className="text-center">Actions</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{products.length > 0 ? (
					products.map((product: Product) => (
						<TableRow key={product.id}>
							<TableCell>
								{product.image ? (
									<img
										src={product.image}
										alt={product.title}
										className="w-16 h-16 object-cover rounded-md mx-auto"
									/>
								) : (
									<div className="w-16 h-16 bg-gray-200 rounded-md mx-auto flex items-center justify-center">
										<span className="text-gray-500 text-xs">Pas d'image</span>
									</div>
								)}
							</TableCell>
							<TableCell className="font-medium">{product.title}</TableCell>
							<TableCell className="max-w-xs truncate">
								{product.description || "Aucune description"}
							</TableCell>
							<TableCell className="font-semibold">
								{product.pricePoints}
							</TableCell>
							<TableCell>
								{(() => {
									const stockStatus = getStockStatus(product.supply);
									const Icon = stockStatus.icon;
									return (
										<Badge
											variant={stockStatus.variant}
											className={stockStatus.className || ""}
										>
											{Icon && <Icon className="h-3 w-3 mr-1" />}
											{stockStatus.label}
										</Badge>
									);
								})()}
							</TableCell>
							<TableCell>
								{product.maxQuantityPerStudent ? (
									<Badge variant="outline" className="text-blue-600">
										{product.maxQuantityPerStudent}
									</Badge>
								) : (
									<span className="text-muted-foreground text-sm">
										Aucune limite
									</span>
								)}
							</TableCell>
							<TableCell>
								<span
									className={`px-2 py-1 rounded-full text-xs ${
										product.isActive
											? "bg-green-100 text-green-800"
											: "bg-gray-100 text-gray-800"
									}`}
								>
									{product.isActive ? "Actif" : "Inactif"}
								</span>
							</TableCell>
							<TableCell>
								<div className="flex gap-2 justify-center">
									<Button
										variant="ghost"
										size="sm"
										onClick={() => onEdit(product)}
										className="text-blue-600 hover:text-blue-800"
									>
										<IconEdit className="h-4 w-4" />
										Modifier
									</Button>
									<Button
										variant="ghost"
										size="sm"
										onClick={() => onDelete(product.id)}
										disabled={isDeleting === product.id}
										className="text-red-600 hover:text-red-800"
									>
										<IconTrash className="h-4 w-4" />
										{isDeleting === product.id ? "..." : "Supprimer"}
									</Button>
								</div>
							</TableCell>
						</TableRow>
					))
				) : (
					<TableRow>
						<TableCell
							colSpan={7}
							className="text-center text-muted-foreground"
						>
							Aucun produit trouvé
						</TableCell>
					</TableRow>
				)}
			</TableBody>
		</Table>
	);
}
