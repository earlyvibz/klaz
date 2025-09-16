import { Card, CardContent, CardHeader, CardTitle } from "@klaz/ui";
import Pagination from "@/components/pagination/pagination";
import { ClaimsCard } from "./claims-card";
import { ClaimsEmptyState } from "./claims-empty-state";

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

interface Meta {
	total: number;
	perPage: number;
	currentPage: number;
	lastPage: number;
}

interface ClaimsListProps {
	claims: ClaimItem[];
	meta: Meta;
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
						<div className="space-y-4">
							{claims.map((claim) => (
								<ClaimsCard
									key={claim.id}
									claim={claim}
									processingClaim={processingClaim}
									onClaimPurchase={onClaimPurchase}
									onCancelPurchase={onCancelPurchase}
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
					<ClaimsEmptyState />
				)}
			</CardContent>
		</Card>
	);
}
