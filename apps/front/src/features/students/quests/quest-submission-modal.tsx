import QuestSubmissionForm from "@/components/forms/quest-submission-form";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import type { Quests } from "@/types";

interface QuestSubmissionModalProps {
	quest: Quests[0];
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export default function QuestSubmissionModal({
	quest,
	open,
	onOpenChange,
}: QuestSubmissionModalProps) {
	const handleSuccess = () => {
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle>Soumettre la quête</DialogTitle>
					<DialogDescription>
						Uploadez une preuve de votre accomplissement pour valider cette
						quête
					</DialogDescription>
				</DialogHeader>

				<QuestSubmissionForm
					quest={quest}
					onCancel={() => onOpenChange(false)}
					onSuccess={handleSuccess}
				/>
			</DialogContent>
		</Dialog>
	);
}
