import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@klaz/ui";
import CustomNotificationForm from "@/components/forms/custom-notification-form";

interface CustomNotificationModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export default function CustomNotificationModal({
	open,
	onOpenChange,
}: CustomNotificationModalProps) {
	const handleSuccess = () => {
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-lg">
				<DialogHeader>
					<DialogTitle>Envoyer une notification personnalisée</DialogTitle>
					<DialogDescription>
						Créez et envoyez une notification personnalisée à vos étudiants.
					</DialogDescription>
				</DialogHeader>

				<CustomNotificationForm
					onCancel={() => onOpenChange(false)}
					onSuccess={handleSuccess}
				/>
			</DialogContent>
		</Dialog>
	);
}
