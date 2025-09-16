import { Button } from "@klaz/ui";
import { useRouter } from "@tanstack/react-router";
import { TuyauHTTPError } from "@tuyau/client";
import { useState } from "react";
import { toast } from "sonner";
import { useAppForm } from "@/hooks/form/form";
import { tuyau } from "@/main";
import type { Quest } from "@/types";
import { questSubmissionSchema } from "@/validators/quest";

interface QuestSubmissionFormProps {
	quest: Quest;
	onCancel: () => void;
	onSuccess?: () => void;
}

export default function QuestSubmissionForm({
	quest,
	onCancel,
	onSuccess,
}: QuestSubmissionFormProps) {
	const router = useRouter();
	const [error, setError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const form = useAppForm({
		defaultValues: {
			file: new File([], ""),
			description: "",
		},
		validators: {
			onSubmit: questSubmissionSchema(quest.type),
		},
		onSubmit: async ({ value }) => {
			setIsSubmitting(true);
			setError(null);

			const { error } = await tuyau.quests({ id: quest.id }).submit.$post({
				image: value.file,
				description: value.description,
			});

			if (error instanceof TuyauHTTPError) {
				setError(error.message);
				setIsSubmitting(false);
				return;
			}

			toast.success("Soumission réussie");
			router.invalidate();
			onSuccess?.();
			setIsSubmitting(false);
		},
	});

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

	return (
		<div className="space-y-4">
			<div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
				<h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
					<span className="text-2xl">{getTypeIcon(quest.type)}</span>
					{quest.title}
				</h3>
				<p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
					{quest.description}
				</p>
				<div className="flex items-center gap-4 text-sm">
					<span className="font-medium text-orange-600 dark:text-orange-400">
						🏆 {quest.points} points
					</span>
					<span className="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-full text-xs">
						{quest.type}
					</span>
				</div>
			</div>

			{error && (
				<div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-md border border-red-200">
					{error}
				</div>
			)}

			<form
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
				className="space-y-4"
			>
				<div className="space-y-2">
					<form.AppField name="file">
						{(field) => (
							<field.FileField
								label="Preuve (screenshot, photo, document)"
								accept="image/*"
							/>
						)}
					</form.AppField>
				</div>

				<div className="space-y-2">
					<form.AppField name="description">
						{(field) => {
							const isSocial = quest.type === "SOCIAL";

							return (
								<field.TextArea
									label={
										isSocial
											? "Description (obligatoire - incluez le lien)"
											: "Description (optionnel)"
									}
									placeholder={
										isSocial
											? "Incluez le lien de la publication/contenu social (ex: https://...)"
											: "Description optionnelle de votre soumission"
									}
									rows={3}
								/>
							);
						}}
					</form.AppField>
				</div>

				<div className="flex gap-3">
					<form.AppForm>
						<form.SubscribeButton
							label={isSubmitting ? "Envoi..." : "Soumettre"}
							isLoading={isSubmitting}
							className="flex-1"
						/>
					</form.AppForm>
					<Button
						type="button"
						variant="outline"
						onClick={onCancel}
						disabled={isSubmitting}
					>
						Annuler
					</Button>
				</div>
			</form>
		</div>
	);
}
