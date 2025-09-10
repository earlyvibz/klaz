import { Button, Card, CardContent, CardHeader, CardTitle } from "@klaz/ui";
import { IconBell, IconSend } from "@tabler/icons-react";
import { useState } from "react";
import CustomNotificationModal from "@/features/admin/notifications/custom-notification-modal";
import type { StudentsCountResponse } from "@/types";

export default function Stats({
	studentsCount,
}: {
	studentsCount: StudentsCountResponse;
}) {
	const [showNotificationModal, setShowNotificationModal] = useState(false);

	return (
		<div className="grid gap-6 md:grid-cols-2">
			{/* Students Count Card */}
			<Card>
				<CardHeader>
					<CardTitle>Nombre d'étudiants</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-3xl font-bold">{studentsCount.count}</p>
				</CardContent>
			</Card>

			{/* Notifications Card */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<IconBell className="h-5 w-5" />
						Notifications
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<p className="text-sm text-muted-foreground">
						Envoyez des notifications personnalisées à vos étudiants
					</p>
					<Button
						onClick={() => setShowNotificationModal(true)}
						className="w-full"
					>
						<IconSend className="h-4 w-4 mr-2" />
						Envoyer une notification
					</Button>
				</CardContent>
			</Card>

			{/* Custom Notification Modal */}
			<CustomNotificationModal
				open={showNotificationModal}
				onOpenChange={setShowNotificationModal}
			/>
		</div>
	);
}
