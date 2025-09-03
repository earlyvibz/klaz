import { cn } from "@klaz/ui";
import { useState } from "react";
import { useAppForm } from "@/hooks/form/form";
import useAuth from "@/stores/auth-store";
import { loginSchema } from "@/validators/auth";

export function LoginForm({
	className,
	...props
}: React.ComponentProps<"form">) {
	const { login, isLoading } = useAuth();
	const [error, setError] = useState<string | null>(null);

	const form = useAppForm({
		defaultValues: {
			password: "",
			email: "",
		},
		validators: {
			onBlur: loginSchema,
		},
		onSubmit: async ({ value }) => {
			setError(null);
			const { success, error } = await login(value.email, value.password);
			if (!success) {
				setError(error || "Une erreur est survenue lors de la connexion");
			}
		},
	});

	return (
		<form
			className={cn("flex flex-col gap-6", className)}
			{...props}
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				form.handleSubmit();
			}}
		>
			<div className="flex flex-col items-center gap-2 text-center">
				<h1 className="text-2xl font-bold">Connectez-vous à votre compte</h1>
				<p className="text-muted-foreground text-sm text-balance">
					Entrez votre email ci-dessous pour vous connecter à votre compte
				</p>
			</div>
			{error && (
				<div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-md border border-red-200">
					{error}
				</div>
			)}
			<div className="grid gap-6">
				<div className="grid gap-3">
					<form.AppField name="email">
						{(field) => <field.TextField label="Email :" />}
					</form.AppField>
				</div>
				<div className="grid gap-3">
					<form.AppField name="password">
						{(field) => (
							<field.PasswordField label="Mot de passe :" isForgotPassword />
						)}
					</form.AppField>
				</div>
				<form.AppForm>
					<form.SubscribeButton label="Connexion" isLoading={isLoading} />
				</form.AppForm>
			</div>
		</form>
	);
}
