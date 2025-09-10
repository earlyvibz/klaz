import { Button, Input, Label, Textarea } from "@klaz/ui";
import { useForm } from "@tanstack/react-form";
import { useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { tuyau } from "@/main";

interface CustomNotificationFormProps {
	onCancel: () => void;
	onSuccess: () => void;
}

export default function CustomNotificationForm({
	onCancel,
	onSuccess,
}: CustomNotificationFormProps) {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const form = useForm({
		defaultValues: {
			title: "",
			message: "",
		},
		onSubmit: async ({ value }) => {
			setIsLoading(true);
			try {
				const response = await tuyau.notifications.custom.$post({
					title: value.title,
					message: value.message,
				});

				if (response.error) {
					toast.error("Erreur lors de l'envoi de la notification");
					return;
				}

				toast.success(`Notification envoyée avec succès`);
				router.invalidate();
				onSuccess();
			} catch {
				toast.error("Erreur lors de l'envoi de la notification");
			} finally {
				setIsLoading(false);
			}
		},
	});

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				form.handleSubmit();
			}}
			className="space-y-6"
		>
			<form.Field
				name="title"
				validators={{
					onChange: ({ value }) => (!value ? "Le titre est requis" : undefined),
				}}
			>
				{(field) => (
					<div className="space-y-2">
						<Label htmlFor={field.name}>Titre de la notification</Label>
						<Input
							id={field.name}
							name={field.name}
							value={field.state.value}
							onChange={(e) => field.handleChange(e.target.value)}
							onBlur={field.handleBlur}
							placeholder="Ex: Maintenance programmée"
							disabled={isLoading}
						/>
						{field.state.meta.errors.length > 0 && (
							<p className="text-sm text-red-500">
								{field.state.meta.errors[0]}
							</p>
						)}
					</div>
				)}
			</form.Field>

			<form.Field
				name="message"
				validators={{
					onChange: ({ value }) =>
						!value ? "Le message est requis" : undefined,
				}}
			>
				{(field) => (
					<div className="space-y-2">
						<Label htmlFor={field.name}>Message</Label>
						<Textarea
							id={field.name}
							name={field.name}
							value={field.state.value}
							onChange={(e) => field.handleChange(e.target.value)}
							onBlur={field.handleBlur}
							placeholder="Votre message aux étudiants..."
							rows={4}
							disabled={isLoading}
						/>
						{field.state.meta.errors.length > 0 && (
							<p className="text-sm text-red-500">
								{field.state.meta.errors[0]}
							</p>
						)}
					</div>
				)}
			</form.Field>

			<div className="flex justify-end gap-3">
				<Button
					type="button"
					variant="outline"
					onClick={onCancel}
					disabled={isLoading}
				>
					Annuler
				</Button>
				<Button type="submit" disabled={isLoading}>
					{isLoading ? "Envoi..." : "Envoyer la notification"}
				</Button>
			</div>
		</form>
	);
}
