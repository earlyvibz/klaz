import QuestCreationForm from "@/components/forms/quest-creation-form";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

interface QuestCreationModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export default function QuestCreationModal({
	open,
	onOpenChange,
}: QuestCreationModalProps) {
	const handleSuccess = () => {
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle>Créer une nouvelle quête</DialogTitle>
					<DialogDescription>
						Créez une nouvelle quête pour engager vos étudiants et gamifier leur
						apprentissage
					</DialogDescription>
				</DialogHeader>

				<QuestCreationForm
					onCancel={() => onOpenChange(false)}
					onSuccess={handleSuccess}
				/>
			</DialogContent>
		</Dialog>
	);
}
