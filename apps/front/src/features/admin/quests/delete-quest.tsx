import { useRouter } from "@tanstack/react-router";
import { Trash } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { tuyau } from "@/main";
import type { Quest } from "@/types";

export default function DeleteQuest({ quest }: { quest: Quest }) {
	const router = useRouter();
	const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const handleDeleteQuest = async () => {
		setIsLoading(true);
		await tuyau.quests({ id: quest.id }).$delete();
		toast.success("Quête supprimée avec succès");
		setShowDeleteDialog(false);
		router.invalidate();
	};

	return (
		<Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
			<DialogTrigger asChild>
				<Button
					variant="outline"
					className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
				>
					<Trash className="w-4 h-4" />
					Supprimer
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Confirmer la suppression</DialogTitle>
					<DialogDescription>
						Êtes-vous sûr de vouloir supprimer la quête "{quest.title}" ? Cette
						action est irréversible.
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
						onClick={handleDeleteQuest}
						disabled={isLoading}
					>
						{isLoading ? "Suppression..." : "Supprimer"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
