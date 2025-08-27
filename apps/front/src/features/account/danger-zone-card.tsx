import { useState } from "react";
import { toast } from "sonner";
import { Button } from "../../components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../../components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "../../components/ui/dialog";
import { tuyau } from "../../main";
import useAuth from "../../stores/auth-store";

export function DangerZoneCard() {
	const { logout } = useAuth();
	const [isLoading, setIsLoading] = useState(false);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);

	const handleDeleteAccount = async () => {
		setIsLoading(true);
		try {
			await tuyau.profile.delete.$delete();
			toast.success("Compte supprimé avec succès");
			logout();
		} catch {
			toast.error("Erreur lors de la suppression du compte");
		} finally {
			setIsLoading(false);
			setShowDeleteDialog(false);
		}
	};

	return (
		<Card className="border-destructive">
			<CardHeader>
				<CardTitle className="text-destructive">Zone dangereuse</CardTitle>
				<CardDescription>
					Actions irréversibles sur votre compte
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
					<DialogTrigger asChild>
						<Button variant="destructive">Supprimer mon compte</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Êtes-vous absolument sûr ?</DialogTitle>
							<DialogDescription>
								Cette action est irréversible. Toutes vos données seront
								définitivement supprimées et vous ne pourrez plus accéder à
								votre compte.
							</DialogDescription>
						</DialogHeader>
						<DialogFooter>
							<Button
								variant="outline"
								onClick={() => setShowDeleteDialog(false)}
								disabled={isLoading}
							>
								Annuler
							</Button>
							<Button
								variant="destructive"
								onClick={handleDeleteAccount}
								disabled={isLoading}
							>
								{isLoading ? "Suppression..." : "Supprimer définitivement"}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</CardContent>
		</Card>
	);
}
