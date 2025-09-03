import { Avatar, AvatarFallback, Badge } from "@klaz/ui";
import type { ColumnDef } from "@tanstack/react-table";
import type { QuestsSubmissions } from "@/types";
import { ProofViewer } from "./proof-viewer";

export const reviewedColumns: ColumnDef<QuestsSubmissions["submissions"][0]>[] =
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
						<div className="text-sm text-gray-700 line-clamp-2 p-2 bg-gray-50 rounded-md border-l-2 border-gray-300">
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
			accessorKey: "status",
			header: "Statut",
			cell: ({ row }) => {
				const status = row.original.status;
				const variant = status === "APPROVED" ? "default" : "destructive";

				const label = status === "APPROVED" ? "✅ Approuvé" : "❌ Rejeté";

				return <Badge variant={variant}>{label}</Badge>;
			},
		},
		{
			accessorKey: "feedback",
			header: "Commentaire",
			cell: ({ row }) => {
				const feedback = row.original.feedback;
				return feedback ? (
					<div className="max-w-xs">
						<div className="text-sm text-muted-foreground line-clamp-2">
							{feedback}
						</div>
					</div>
				) : (
					<span className="text-muted-foreground">Aucun</span>
				);
			},
		},
		{
			accessorKey: "submittedAt",
			header: "Date",
			cell: ({ row }) => {
				const submittedAt = row.original.submittedAt;
				if (!submittedAt) return "N/A";

				const date = new Date(submittedAt);
				return (
					<div className="text-sm">
						{date.toLocaleDateString("fr-FR", {
							day: "2-digit",
							month: "2-digit",
							year: "numeric",
						})}
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
					<div className="flex justify-center">
						<ProofViewer
							proofUrl={url}
							questTitle={quest?.title}
							studentName={
								user ? `${user.firstName} ${user.lastName}` : undefined
							}
						/>
					</div>
				) : (
					<span className="text-muted-foreground">-</span>
				);
			},
		},
	];
