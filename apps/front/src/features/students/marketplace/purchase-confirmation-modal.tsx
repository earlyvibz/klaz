import {
	Button,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@klaz/ui";
import { IconCheck, IconCoins, IconShoppingCart } from "@tabler/icons-react";
import { useState } from "react";
import { toast } from "sonner";
import { tuyau } from "@/main";
import useAuth from "@/stores/auth-store";
import type { Product } from "@/types";

interface PurchaseConfirmationModalProps {
	product: Product | null;
	onClose: () => void;
	onPurchaseSuccess: () => void;
}

export default function PurchaseConfirmationModal({
	product,
	onClose,
	onPurchaseSuccess,
}: PurchaseConfirmationModalProps) {
	const { user } = useAuth();
	const [purchaseInProgress, setPurchaseInProgress] = useState<boolean>(false);
	const [purchaseSuccess, setPurchaseSuccess] = useState<boolean>(false);

	const handleConfirmPurchase = async () => {
		if (!product) return;

		setPurchaseInProgress(true);
		try {
			await tuyau.marketplace.products({ id: product.id }).purchase.$post({});

			// Show success animation
			setPurchaseSuccess(true);

			// Close modal after animation
			setTimeout(() => {
				onClose();
				setPurchaseSuccess(false);
				toast.success("Produit acheté avec succès !");
				onPurchaseSuccess();
			}, 2000);
		} catch (error) {
			console.error("Erreur lors de l'achat:", error);
			toast.error("Erreur lors de l'achat du produit");
		} finally {
			setPurchaseInProgress(false);
		}
	};

	const handleClose = () => {
		if (!purchaseSuccess) {
			onClose();
		}
	};

	return (
		<Dialog open={!!product} onOpenChange={(open) => !open && handleClose()}>
			<DialogContent className="max-w-md">
				{purchaseSuccess ? (
					// Success Animation
					<div className="flex flex-col items-center justify-center py-8 space-y-4">
						<div className="relative">
							<div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-pulse">
								<IconCheck className="w-10 h-10 text-green-600 animate-bounce" />
							</div>
							<div className="absolute inset-0 w-20 h-20 border-4 border-green-200 rounded-full animate-ping"></div>
						</div>
						<div className="text-center space-y-2">
							<h3 className="text-xl font-semibold text-green-600">
								Achat réussi !
							</h3>
							<p className="text-sm text-muted-foreground">
								{product?.title} a été ajouté à vos achats
							</p>
						</div>
					</div>
				) : (
					// Confirmation Content
					<>
						<DialogHeader>
							<DialogTitle>Confirmer l'achat</DialogTitle>
							<DialogDescription>
								Êtes-vous sûr de vouloir acheter ce produit ?
							</DialogDescription>
						</DialogHeader>

						{product && (
							<div className="space-y-4">
								<div className="flex gap-4">
									{product.image ? (
										<img
											src={product.image}
											alt={product.title}
											className="w-20 h-20 object-cover rounded-md"
										/>
									) : (
										<div className="w-20 h-20 bg-gray-200 rounded-md flex items-center justify-center">
											<span className="text-gray-500 text-xs">Pas d'image</span>
										</div>
									)}
									<div className="flex-1">
										<h3 className="font-semibold">{product.title}</h3>
										<p className="text-sm text-muted-foreground line-clamp-2">
											{product.description || "Aucune description"}
										</p>
									</div>
								</div>

								<div className="bg-gray-50 p-4 rounded-lg space-y-2">
									<div className="flex justify-between">
										<span>Prix :</span>
										<div className="flex items-center gap-1 text-orange-600 font-semibold">
											<IconCoins className="h-4 w-4" />
											{product.pricePoints} points
										</div>
									</div>
									{product.maxQuantityPerStudent && (
										<div className="flex justify-between">
											<span>Limite par étudiant :</span>
											<span className="text-blue-600 font-medium">
												{product.maxQuantityPerStudent}
											</span>
										</div>
									)}
									{user && (
										<>
											<div className="flex justify-between">
												<span>Vos points actuels :</span>
												<div className="flex items-center gap-1">
													<IconCoins className="h-4 w-4" />
													{user.points.toLocaleString()} points
												</div>
											</div>
											<div className="flex justify-between font-semibold border-t pt-2">
												<span>Points restants :</span>
												<div className="flex items-center gap-1">
													<IconCoins className="h-4 w-4" />
													{(user.points - product.pricePoints).toLocaleString()}{" "}
													points
												</div>
											</div>
										</>
									)}
								</div>
							</div>
						)}

						<DialogFooter>
							<Button variant="outline" onClick={onClose}>
								Annuler
							</Button>
							<Button
								onClick={handleConfirmPurchase}
								disabled={purchaseInProgress}
							>
								<IconShoppingCart className="mr-2 h-4 w-4" />
								{purchaseInProgress ? "Achat..." : "Confirmer l'achat"}
							</Button>
						</DialogFooter>
					</>
				)}
			</DialogContent>
		</Dialog>
	);
}
