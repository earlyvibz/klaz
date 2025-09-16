import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	Table,
	TableBody,
	TableHead,
	TableHeader,
	TableRow,
} from "@klaz/ui";
import Pagination from "@/components/pagination/pagination";
import type { Claim, ClaimsMeta } from "@/types";
import { ClaimsEmptyState } from "./claims-empty-state";
import { ClaimsTableRow } from "./claims-table-row";

interface ClaimsListProps {
	claims: Claim[];
	meta: ClaimsMeta;
	currentLimit: number;
	processingClaim: string | undefined;
	onPageChange: (page: number) => void;
	onLimitChange: (limit: number) => void;
	onClaimPurchase: (claimId: string) => void;
	onCancelPurchase: (claimId: string) => void;
}

export function ClaimsList({
	claims,
	meta,
	currentLimit,
	processingClaim,
	onPageChange,
	onLimitChange,
	onClaimPurchase,
	onCancelPurchase,
}: ClaimsListProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Réclamations en attente ({meta?.total || 0})</CardTitle>
			</CardHeader>
			<CardContent>
				{claims.length > 0 ? (
					<>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Produit</TableHead>
									<TableHead>Étudiant</TableHead>
									<TableHead>Date d'achat</TableHead>
									<TableHead className="text-right">Points</TableHead>
									<TableHead className="text-right">Quantité</TableHead>
									<TableHead className="text-center">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{claims.map((claim) => (
									<ClaimsTableRow
										key={claim.id}
										claim={claim}
										processingClaim={processingClaim}
										onClaimPurchase={onClaimPurchase}
										onCancelPurchase={onCancelPurchase}
									/>
								))}
							</TableBody>
						</Table>

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
					<ClaimsEmptyState />
				)}
			</CardContent>
		</Card>
	);
}
