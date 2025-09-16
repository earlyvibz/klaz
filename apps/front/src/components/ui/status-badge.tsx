import { Badge } from "@klaz/ui";
import { IconCheck, IconClock, IconX } from "@tabler/icons-react";

type StatusBadgeProps = {
	status: "pending" | "claimed" | "cancelled";
};

export function StatusBadge({ status }: StatusBadgeProps) {
	switch (status) {
		case "pending":
			return (
				<Badge
					variant="secondary"
					className="bg-yellow-100 text-yellow-800 border-yellow-200"
				>
					<IconClock className="h-3 w-3 mr-1" />
					En attente
				</Badge>
			);
		case "claimed":
			return (
				<Badge
					variant="secondary"
					className="bg-green-100 text-green-800 border-green-200"
				>
					<IconCheck className="h-3 w-3 mr-1" />
					Récupéré
				</Badge>
			);
		case "cancelled":
			return (
				<Badge
					variant="secondary"
					className="bg-red-100 text-red-800 border-red-200"
				>
					<IconX className="h-3 w-3 mr-1" />
					Annulé
				</Badge>
			);
		default:
			return <Badge variant="secondary">{status}</Badge>;
	}
}
