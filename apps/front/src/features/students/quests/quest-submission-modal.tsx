import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@klaz/ui";
import QuestSubmissionForm from "@/components/forms/quest-submission-form";
import type { Quest } from "@/types";

interface QuestSubmissionModalProps {
	quest: Quest;
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
