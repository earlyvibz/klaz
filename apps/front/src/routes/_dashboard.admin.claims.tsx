import {
	createFileRoute,
	useNavigate,
	useRouter,
} from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import Pending from "@/components/pending/pending";
import { ClaimsHeader } from "@/features/admin/claims/claims-header";
import { ClaimsList } from "@/features/admin/claims/claims-list";
import { tuyau } from "@/main";
import type { ClaimsResponse, SearchParams } from "@/types/claims";

export const Route = createFileRoute("/_dashboard/admin/claims")({
	component: AdminClaims,
	validateSearch: (search: Record<string, unknown>): SearchParams => {
		return {
			page: Number(search.page) || 1,
			limit: Number(search.limit) || 10,
		};
	},
	loaderDeps: ({ search }) => ({
		page: search.page || 1,
		limit: search.limit || 10,
	}),
	loader: async ({ deps }) => {
		const claimsResponse = await tuyau.marketplace.claims.$get({
			query: {
				page: deps.page,
				limit: deps.limit,
			},
		});

		return claimsResponse;
	},
	pendingComponent: Pending,
});

function AdminClaims() {
	const router = useRouter();
	const response = Route.useLoaderData();
	const { limit } = Route.useSearch();
	const navigate = useNavigate();
	const [processingClaim, setProcessingClaim] = useState<string | undefined>(
		undefined,
	);

	if (response.error) {
		return (
			<div className="container mx-auto py-8">
				<div className="text-center">
					<h1 className="text-2xl font-bold text-red-600 mb-2">Erreur</h1>
					<p className="text-muted-foreground">
						Une erreur est survenue lors du chargement des réclamations
					</p>
				</div>
			</div>
		);
	}

	const data = response.data as ClaimsResponse;
	const claims = data.purchases || [];
	const meta = data.meta;
	const currentLimit = limit || 10;

	const handlePageChange = (newPage: number) => {
		navigate({
			to: "/admin/claims",
			search: { page: newPage, limit: currentLimit },
		});
	};

	const handleLimitChange = (newLimit: number) => {
		navigate({
			to: "/admin/claims",
			search: { page: 1, limit: newLimit },
		});
	};

	const handleClaimPurchase = async (claimId: string) => {
		setProcessingClaim(claimId);
		try {
			await tuyau.marketplace.claims({ id: claimId }).claim.$post({});
			toast.success("Réclamation marquée comme récupérée");
			router.invalidate();
		} catch (error) {
			console.error("Erreur lors de la validation:", error);
			toast.error("Erreur lors de la validation de la réclamation");
		} finally {
			setProcessingClaim(undefined);
		}
	};

	const handleCancelPurchase = async (claimId: string) => {
		setProcessingClaim(claimId);
		try {
			await tuyau.marketplace.claims({ id: claimId }).cancel.$post({});
			toast.success("Réclamation annulée et points remboursés");
			router.invalidate();
		} catch (error) {
			console.error("Erreur lors de l'annulation:", error);
			toast.error("Erreur lors de l'annulation de la réclamation");
		} finally {
			setProcessingClaim(undefined);
		}
	};

	return (
		<div className="space-y-6">
			<div className="bg-white">
				<div className="container mx-auto py-8">
					<ClaimsHeader />
					<ClaimsList
						claims={claims}
						meta={meta}
						currentLimit={currentLimit}
						processingClaim={processingClaim}
						onPageChange={handlePageChange}
						onLimitChange={handleLimitChange}
						onClaimPurchase={handleClaimPurchase}
						onCancelPurchase={handleCancelPurchase}
					/>
				</div>
			</div>
		</div>
	);
}
