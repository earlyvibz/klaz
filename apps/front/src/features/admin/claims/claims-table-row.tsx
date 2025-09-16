import { Button, TableCell, TableRow } from "@klaz/ui";
import { IconCoins } from "@tabler/icons-react";
import type { Claim } from "@/types";

interface ClaimsTableRowProps {
	claim: Claim;
	processingClaim: string | undefined;
	onClaimPurchase: (claimId: string) => void;
	onCancelPurchase: (claimId: string) => void;
}

export function ClaimsTableRow({
	claim,
	processingClaim,
	onClaimPurchase,
	onCancelPurchase,
}: ClaimsTableRowProps) {
	return (
		<TableRow>
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
							<span className="text-gray-500 text-xs">N/A</span>
						</div>
					)}
					<div>
						<div className="font-semibold">{claim.product.title}</div>
						<div className="text-sm text-muted-foreground line-clamp-1">
							{claim.product.description}
						</div>
					</div>
				</div>
			</TableCell>
			<TableCell>
				<div>
					<div className="font-medium">
						{claim.user?.firstName || "N/A"} {claim.user?.lastName || ""}
					</div>
					<div className="text-sm text-muted-foreground">
						{claim.user?.email || "Email non disponible"}
					</div>
				</div>
			</TableCell>
			<TableCell>
				<div className="text-sm">
					{new Date(claim.createdAt).toLocaleDateString("fr-FR", {
						day: "numeric",
						month: "short",
						year: "numeric",
						hour: "2-digit",
						minute: "2-digit",
					})}
				</div>
			</TableCell>
			<TableCell className="text-right">
				<div className="flex items-center justify-end gap-1 text-orange-600 font-semibold">
					<IconCoins className="h-4 w-4" />
					{claim.totalPoints}
				</div>
			</TableCell>
			<TableCell className="text-right">{claim.quantity}</TableCell>
			<TableCell className="text-center">
				<div className="flex gap-2 justify-center">
					<Button
						size="sm"
						onClick={() => onClaimPurchase(claim.id)}
						disabled={processingClaim === claim.id}
					>
						{processingClaim === claim.id ? "..." : "Récupéré"}
					</Button>
					<Button
						size="sm"
						variant="destructive"
						onClick={() => onCancelPurchase(claim.id)}
						disabled={processingClaim === claim.id}
					>
						{processingClaim === claim.id ? "..." : "Annuler"}
					</Button>
				</div>
			</TableCell>
		</TableRow>
	);
}
