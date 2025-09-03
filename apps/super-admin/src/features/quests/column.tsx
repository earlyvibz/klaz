import { Badge, Button } from "@klaz/ui";
import type { ColumnDef } from "@tanstack/react-table";
import Approve from "@/features/quests/approve";
import type { QuestsSubmissions } from "@/types";
import Reject from "./reject";

export const columns: ColumnDef<QuestsSubmissions["submissions"][0]>[] = [
	{
		accessorKey: "user",
		header: "Étudiant",
		cell: ({ row }) => {
			const user = row.original.user;
			return user ? `${user.firstName} ${user.lastName}` : "N/A";
		},
	},
	{
		accessorKey: "quest",
		header: "Quête",
		cell: ({ row }) => {
			const quest = row.original.quest;
			return (
				<div className="max-w-md">
					<div className="font-medium">{quest?.title}</div>
					<div className="text-sm text-muted-foreground mb-1">
						{quest?.points} points
					</div>
					{quest?.description && (
						<div className="text-xs text-muted-foreground line-clamp-2">
							{quest.description}
						</div>
					)}
				</div>
			);
		},
	},
	{
		accessorKey: "submittedAt",
		header: "Soumis le",
		cell: ({ row }) => {
			const submittedAt = row.original.submittedAt;
			if (!submittedAt) return "N/A";
			const date = new Date(submittedAt);
			return date.toLocaleDateString("fr-FR", {
				day: "2-digit",
				month: "2-digit",
				year: "numeric",
				hour: "2-digit",
				minute: "2-digit",
			});
		},
	},
	{
		accessorKey: "status",
		header: "Statut",
		cell: ({ row }) => {
			const status = row.original.status;
			const variant =
				status === "PENDING"
					? "secondary"
					: status === "APPROVED"
						? "default"
						: "destructive";

			const label =
				status === "PENDING"
					? "En attente"
					: status === "APPROVED"
						? "Approuvé"
						: "Rejeté";

			return <Badge variant={variant}>{label}</Badge>;
		},
	},
	{
		accessorKey: "proofUrl",
		header: "Preuve",
		cell: ({ row }) => {
			const url = row.original.proofUrl;
			return url ? (
				<Button variant="outline" size="sm" asChild>
					<a href={url} target="_blank" rel="noopener noreferrer">
						Voir
					</a>
				</Button>
			) : (
				"Aucune"
			);
		},
	},
	{
		id: "actions",
		header: "Actions",
		cell: ({ row }) => {
			const submission = row.original;
			if (submission.status !== "PENDING") return null;

			return (
				<div className="flex gap-2">
					<Approve questSubmissionId={submission.id} />
					<Reject questSubmissionId={submission.id} />
				</div>
			);
		},
	},
];
