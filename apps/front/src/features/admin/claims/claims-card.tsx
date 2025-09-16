import { Button, Card, CardContent } from "@klaz/ui";
import { IconCoins } from "@tabler/icons-react";

interface ClaimItem {
	id: string;
	quantity: number;
	totalPoints: number;
	status: "pending" | "claimed" | "cancelled";
	createdAt: string;
	user: {
		id: string;
		firstName: string;
		lastName: string;
		email: string;
	};
	product: {
		id: string;
		title: string;
		description: string;
		image: string;
		pricePoints: number;
	};
}

interface ClaimsCardProps {
	claim: ClaimItem;
	processingClaim: string | undefined;
	onClaimPurchase: (claimId: string) => void;
	onCancelPurchase: (claimId: string) => void;
}

export function ClaimsCard({
	claim,
	processingClaim,
	onClaimPurchase,
	onCancelPurchase,
}: ClaimsCardProps) {
	return (
		<Card className="overflow-hidden">
			<CardContent className="p-6">
				<div className="flex gap-4">
					{claim.product.image ? (
						<img
							src={claim.product.image}
							alt={claim.product.title}
							className="w-20 h-20 object-cover rounded-md flex-shrink-0"
						/>
					) : (
						<div className="w-20 h-20 bg-gray-200 rounded-md flex items-center justify-center flex-shrink-0">
							<span className="text-gray-500 text-xs">Pas d'image</span>
						</div>
					)}

					<div className="flex-1 min-w-0">
						<div className="flex justify-between items-start mb-2">
							<div>
								<h3 className="text-lg font-semibold">{claim.product.title}</h3>
								<p className="text-sm text-muted-foreground">
									{claim.product.description}
								</p>
							</div>
							<div className="text-right">
								<div className="flex items-center gap-1 text-orange-600 font-semibold">
									<IconCoins className="h-4 w-4" />
									{claim.totalPoints} points
								</div>
								<div className="text-sm text-muted-foreground">
									Qté: {claim.quantity}
								</div>
							</div>
						</div>

						<div className="flex justify-between items-center mb-4">
							<div>
								<p className="font-medium">
									{claim.user?.firstName || "N/A"} {claim.user?.lastName || ""}
								</p>
								<p className="text-sm text-muted-foreground">
									{claim.user?.email || "Email non disponible"}
								</p>
							</div>
							<div className="text-sm text-muted-foreground">
								Acheté le{" "}
								{new Date(claim.createdAt).toLocaleDateString("fr-FR", {
									day: "numeric",
									month: "long",
									year: "numeric",
									hour: "2-digit",
									minute: "2-digit",
								})}
							</div>
						</div>

						<div className="flex gap-2">
							<Button
								onClick={() => onClaimPurchase(claim.id)}
								disabled={processingClaim === claim.id}
								className="flex-1"
							>
								{processingClaim === claim.id
									? "Traitement..."
									: "Marquer comme récupéré"}
							</Button>
							<Button
								variant="destructive"
								onClick={() => onCancelPurchase(claim.id)}
								disabled={processingClaim === claim.id}
							>
								{processingClaim === claim.id
									? "Traitement..."
									: "Annuler et rembourser"}
							</Button>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
