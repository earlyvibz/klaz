import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@klaz/ui";
import QuestCreationForm from "@/components/forms/quest-creation-form";
import type { Quest } from "@/types";

interface QuestCreationModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	quest?: Quest;
}

export default function QuestCreationModal({
	open,
	onOpenChange,
	quest,
}: QuestCreationModalProps) {
	const handleSuccess = () => {
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle>
						{quest ? "Modifier la quête" : "Créer une nouvelle quête"}
					</DialogTitle>
					{!quest && (
						<DialogDescription>
							Créez une nouvelle quête pour engager vos étudiants et gamifier
							leur apprentissage"
						</DialogDescription>
					)}
				</DialogHeader>

				<QuestCreationForm
					onCancel={() => onOpenChange(false)}
					onSuccess={handleSuccess}
					quest={quest}
				/>
			</DialogContent>
		</Dialog>
	);
}
