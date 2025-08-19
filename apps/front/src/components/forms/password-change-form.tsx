import { useState } from "react";
import { toast } from "sonner";
import { useAppForm } from "@/hooks/form/form";
import { cn } from "@/lib/utils";
import { changePasswordSchema } from "@/validators/auth";
import { tuyau } from "../../main";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../ui/card";

export function PasswordChangeForm({
	className,
	...props
}: React.ComponentProps<"form">) {
	const [error, setError] = useState<string | null>(null);

	const form = useAppForm({
		defaultValues: {
			currentPassword: "",
			newPassword: "",
			confirmPassword: "",
		},
		validators: {
			onBlur: changePasswordSchema,
		},
		onSubmit: async ({ value }) => {
			setError(null);
			try {
				const { data, error } = await tuyau.profile.password.$put({
					currentPassword: value.currentPassword,
					newPassword: value.newPassword,
				});

				if (data) {
					toast.success("Mot de passe modifié avec succès");
					form.reset();
				}

				if (error) {
					setError("Erreur lors du changement de mot de passe");
				}
			} catch {
				setError("Erreur lors du changement de mot de passe");
			}
		},
	});

	return (
		<Card>
			<CardHeader>
				<CardTitle>Sécurité</CardTitle>
				<CardDescription>
					Changez votre mot de passe pour sécuriser votre compte
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form
					className={cn("flex flex-col gap-4", className)}
					{...props}
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						form.handleSubmit();
					}}
				>
					{error && (
						<div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-md border border-red-200">
							{error}
						</div>
					)}

					<div className="grid gap-3">
						<form.AppField name="currentPassword">
							{(field) => <field.PasswordField label="Mot de passe actuel :" />}
						</form.AppField>
					</div>

					<div className="grid gap-3">
						<form.AppField name="newPassword">
							{(field) => (
								<field.PasswordField label="Nouveau mot de passe :" />
							)}
						</form.AppField>
					</div>

					<div className="grid gap-3">
						<form.AppField name="confirmPassword">
							{(field) => (
								<field.PasswordField label="Confirmer le nouveau mot de passe :" />
							)}
						</form.AppField>
					</div>

					<form.AppForm>
						<form.SubscribeButton
							label="Changer le mot de passe"
							isLoading={false}
						/>
					</form.AppForm>
				</form>
			</CardContent>
		</Card>
	);
}
