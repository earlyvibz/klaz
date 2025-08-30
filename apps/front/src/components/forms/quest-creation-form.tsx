import { TuyauHTTPError } from "@tuyau/client";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAppForm } from "@/hooks/form/form";
import { tuyau } from "@/main";
import type { CreateQuestRequest } from "@/types";
import { createQuestSchema } from "@/validators/quest";

interface QuestCreationFormProps {
	onCancel: () => void;
	onSuccess?: () => void;
}

export default function QuestCreationForm({
	onCancel,
	onSuccess,
}: QuestCreationFormProps) {
	const [error, setError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const form = useAppForm({
		defaultValues: {
			title: "",
			description: "",
			type: "UGC",
			points: 1,
			deadline: null as Date | null,
			validationType: "MANUAL" as "MANUAL" | "AUTO_API",
		},
		validators: {
			onSubmit: createQuestSchema,
		},
		onSubmit: async ({ value }) => {
			setIsSubmitting(true);
			setError(null);

			const payload: CreateQuestRequest = {
				title: value.title,
				description: value.description,
				type: value.type,
				points: value.points,
				validationType: value.validationType,
			};

			if (value.deadline) {
				payload.deadline = new Date(
					value.deadline.setHours(23, 59, 59, 999),
				).toISOString();
			}

			const { error } = await tuyau.quests.$post(payload);

			if (error instanceof TuyauHTTPError) {
				setError(error.value.errors[0].message);
				setIsSubmitting(false);
				return;
			}

			toast.success("Quête créée avec succès");
			onSuccess?.();
			setIsSubmitting(false);
		},
	});

	return (
		<div className="space-y-4">
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
					<form.AppField name="title">
						{(field) => (
							<field.TextField label="Titre" placeholder="Titre de la quête" />
						)}
					</form.AppField>
				</div>

				<div className="space-y-2">
					<form.AppField name="description">
						{(field) => (
							<field.TextArea
								label="Description"
								placeholder="Description de la quête"
								rows={3}
							/>
						)}
					</form.AppField>
				</div>

				<div className="space-y-2">
					<form.AppField name="type">
						{(field) => (
							<field.Select
								label="Type"
								values={[
									{ value: "UGC", label: "📝 UGC" },
									{ value: "SOCIAL", label: "🤝 Social" },
									{ value: "EVENT", label: "🎯 Événement" },
								]}
							/>
						)}
					</form.AppField>
				</div>

				<div className="space-y-2">
					<form.AppField name="points">
						{(field) => <field.NumberField label="Points" placeholder="1" />}
					</form.AppField>
				</div>

				<div className="space-y-2">
					<form.AppField name="deadline">
						{(field) => <field.DateField label="Date limite (optionnel)" />}
					</form.AppField>
				</div>

				<div className="space-y-2">
					<form.AppField name="validationType">
						{(field) => (
							<field.Select
								label="Type de validation"
								values={[
									{ value: "MANUAL", label: "Manuelle" },
									{ value: "AUTO_API", label: "Automatique (API)" },
								]}
							/>
						)}
					</form.AppField>
				</div>

				<div className="flex gap-3">
					<form.AppForm>
						<form.SubscribeButton
							label={isSubmitting ? "Création..." : "Créer la quête"}
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
