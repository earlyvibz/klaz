import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@klaz/ui";
import ProductCreationForm from "@/components/forms/product-creation-form";
import type { Product } from "@/types";

interface ProductCreationModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	product?: Product;
	schoolId: string;
}

export default function ProductCreationModal({
	open,
	onOpenChange,
	product,
	schoolId,
}: ProductCreationModalProps) {
	const handleSuccess = () => {
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>
						{product ? "Modifier le produit" : "Ajouter un nouveau produit"}
					</DialogTitle>
					<DialogDescription>
						{product
							? "Modifiez les informations du produit"
							: "Ajoutez un nouveau produit au marketplace pour que les étudiants puissent l'acheter avec leurs points"}
					</DialogDescription>
				</DialogHeader>

				<ProductCreationForm
					onCancel={() => onOpenChange(false)}
					onSuccess={handleSuccess}
					product={product}
					schoolId={schoolId}
				/>
			</DialogContent>
		</Dialog>
	);
}
