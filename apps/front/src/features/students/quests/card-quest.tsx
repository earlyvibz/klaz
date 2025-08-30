import { CheckCircle, Clock, Target, Trophy } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import type { Quest } from "@/types";
import QuestSubmissionModal from "./quest-submission-modal";

export default function CardQuest({ quest }: { quest: Quest }) {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const isDeadlineSoon =
		quest.deadline &&
		new Date(quest.deadline) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
	const isExpired = quest.deadline && new Date(quest.deadline) < new Date();

	// Récupérer la soumission de l'utilisateur pour cette quête
	const userSubmission = quest.submissions?.[0]; // Il ne devrait y avoir qu'une soumission par utilisateur
	const submissionStatus = userSubmission?.status;

	const getTypeIcon = (type: string) => {
		switch (type) {
			case "UGC":
				return "📝";
			case "SOCIAL":
				return "🤝";
			case "EVENT":
				return "🎯";
			default:
				return "⭐";
		}
	};

	const getTypeColor = (type: string) => {
		switch (type) {
			case "UGC":
				return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
			case "SOCIAL":
				return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
			case "EVENT":
				return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300";
			default:
				return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300";
		}
	};

	const getSubmissionBadge = () => {
		if (!submissionStatus) return null;

		switch (submissionStatus) {
			case "PENDING":
				return (
					<div className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400">
						<Clock className="w-4 h-4" />
						<span className="text-xs font-medium">En attente</span>
					</div>
				);
			case "APPROVED":
				return (
					<div className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
						<CheckCircle className="w-4 h-4" />
						<span className="text-xs font-medium">Validée</span>
					</div>
				);
			case "REJECTED":
				return (
					<div className="flex items-center gap-1.5 text-red-600 dark:text-red-400">
						<Target className="w-4 h-4" />
						<span className="text-xs font-medium">Refusée</span>
					</div>
				);
			default:
				return null;
		}
	};

	return (
		<Card
			className={`relative h-full flex flex-col transition-all duration-200 hover:shadow-lg hover:-translate-y-1 group ${isExpired ? "opacity-75" : ""}`}
		>
			{isExpired && (
				<div className="absolute top-4 right-4 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
					Expired
				</div>
			)}

			<CardHeader>
				<div className="flex items-start justify-between">
					<div className="flex-1">
						<div className="flex items-center gap-2 mb-2">
							<span
								className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(quest.type)}`}
							>
								{getTypeIcon(quest.type)} {quest.type}
							</span>
							{quest.validationType === "AUTO_API" && (
								<span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
									<CheckCircle className="w-3 h-3" />
									Auto
								</span>
							)}
						</div>
						<CardTitle className="text-lg font-bold group-hover:text-primary transition-colors">
							{quest.title}
						</CardTitle>
						<CardDescription className="mt-2 text-sm leading-relaxed">
							{quest.description}
						</CardDescription>
					</div>
				</div>
			</CardHeader>

			<CardContent className="flex-1">
				<div className="flex items-center justify-between text-sm">
					<div className="flex items-center gap-4">
						<div className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400">
							<Trophy className="w-4 h-4" />
							<span className="font-semibold">{quest.points} pts</span>
						</div>

						{quest.deadline && (
							<div
								className={`flex items-center gap-1.5 ${isDeadlineSoon ? "text-red-600 dark:text-red-400" : "text-gray-600 dark:text-gray-400"}`}
							>
								<Clock className="w-4 h-4" />
								<span className="text-xs">
									{new Date(quest.deadline).toLocaleDateString("fr-FR", {
										day: "numeric",
										month: "short",
										hour: "2-digit",
										minute: "2-digit",
									})}
								</span>
							</div>
						)}
					</div>

					<div className="flex items-center gap-2">
						{getSubmissionBadge()}
						{!quest.isActive && (
							<span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
								Inactive
							</span>
						)}
					</div>
				</div>
			</CardContent>

			<CardFooter className="pt-0 mt-auto">
				<Button
					className="w-full group-hover:shadow-md transition-all"
					disabled={
						!quest.isActive ||
						!!isExpired ||
						submissionStatus === "APPROVED" ||
						submissionStatus === "PENDING"
					}
					onClick={() => setIsModalOpen(true)}
					variant={submissionStatus === "APPROVED" ? "outline" : "default"}
				>
					{submissionStatus === "APPROVED" ? (
						<>
							<CheckCircle className="w-4 h-4" />
							Quête terminée
						</>
					) : submissionStatus === "PENDING" ? (
						<>
							<Clock className="w-4 h-4" />
							En attente de validation
						</>
					) : submissionStatus === "REJECTED" ? (
						<>
							<Target className="w-4 h-4" />
							Soumettre à nouveau
						</>
					) : isExpired ? (
						<>
							<Target className="w-4 h-4" />
							Quête expirée
						</>
					) : (
						<>
							<Target className="w-4 h-4" />
							Commencer la quête
						</>
					)}
				</Button>
			</CardFooter>

			<QuestSubmissionModal
				quest={quest}
				open={isModalOpen}
				onOpenChange={setIsModalOpen}
			/>
		</Card>
	);
}
