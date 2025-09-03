import { Avatar, AvatarFallback } from "@klaz/ui";
import type { ColumnDef } from "@tanstack/react-table";
import Approve from "@/features/quests/approve";
import type { QuestsSubmissions } from "@/types";
import { ProofViewer } from "./proof-viewer";
import Reject from "./reject";

export const pendingColumns: ColumnDef<QuestsSubmissions["submissions"][0]>[] =
	[
		{
			accessorKey: "user",
			header: "Étudiant",
			cell: ({ row }) => {
				const user = row.original.user;
				if (!user) return "N/A";

				const initials = `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`;

				return (
					<div className="flex items-center gap-3">
						<Avatar className="h-8 w-8">
							<AvatarFallback className="text-xs font-medium">
								{initials}
							</AvatarFallback>
						</Avatar>
						<div>
							<div className="font-medium">
								{user.firstName} {user.lastName}
							</div>
							<div className="text-xs text-muted-foreground">{user.email}</div>
						</div>
					</div>
				);
			},
		},
		{
			accessorKey: "school",
			header: "École",
			cell: ({ row }) => {
				const school = row.original.user?.school;
				return school ? (
					<div className="text-sm font-medium">{school.name}</div>
				) : (
					<span className="text-muted-foreground">N/A</span>
				);
			},
		},
		{
			accessorKey: "quest",
			header: "Quête",
			cell: ({ row }) => {
				const quest = row.original.quest;
				return (
					<div className="space-y-1">
						<div className="font-medium">{quest?.title}</div>
						<div className="text-sm text-blue-600 font-medium">
							{quest?.points} points
						</div>
					</div>
				);
			},
		},
		{
			accessorKey: "studentComment",
			header: "Commentaire étudiant",
			cell: ({ row }) => {
				const comment = row.original.studentComment;
				return comment ? (
					<div className="max-w-xs">
						<div className="text-sm text-gray-700 line-clamp-3 p-2 bg-blue-50 rounded-md border-l-2 border-blue-200">
							"{comment}"
						</div>
					</div>
				) : (
					<span className="text-muted-foreground text-sm italic">
						Aucun commentaire
					</span>
				);
			},
		},
		{
			accessorKey: "submittedAt",
			header: "Soumis",
			cell: ({ row }) => {
				const submittedAt = row.original.submittedAt;
				if (!submittedAt) return "N/A";

				const date = new Date(submittedAt);
				const now = new Date();
				const diffHours = Math.floor(
					(now.getTime() - date.getTime()) / (1000 * 60 * 60),
				);

				let timeAgo = "";
				if (diffHours < 1) {
					timeAgo = "À l'instant";
				} else if (diffHours < 24) {
					timeAgo = `Il y a ${diffHours}h`;
				} else {
					const diffDays = Math.floor(diffHours / 24);
					timeAgo = `Il y a ${diffDays}j`;
				}

				return (
					<div className="space-y-1">
						<div className="text-sm">{timeAgo}</div>
						<div className="text-xs text-muted-foreground">
							{date.toLocaleDateString("fr-FR", {
								day: "2-digit",
								month: "2-digit",
								hour: "2-digit",
								minute: "2-digit",
							})}
						</div>
					</div>
				);
			},
		},
		{
			accessorKey: "proofUrl",
			header: "Preuve",
			cell: ({ row }) => {
				const url = row.original.proofUrl;
				const user = row.original.user;
				const quest = row.original.quest;

				return url ? (
					<ProofViewer
						proofUrl={url}
						questTitle={quest?.title}
						studentName={
							user ? `${user.firstName} ${user.lastName}` : undefined
						}
					/>
				) : (
					<span className="text-muted-foreground">Aucune</span>
				);
			},
		},
		{
			id: "actions",
			header: "Actions",
			cell: ({ row }) => {
				const submission = row.original;

				return (
					<div className="flex gap-2">
						<Approve questSubmissionId={submission.id} />
						<Reject questSubmissionId={submission.id} />
					</div>
				);
			},
		},
	];
