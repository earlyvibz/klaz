import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAppForm } from "@/hooks/form/form";
import { cn } from "@/lib/utils";
import useAuth from "@/stores/auth-store";
import { signupSchema } from "@/validators/auth";

export function SignupForm({
	className,
	...props
}: React.ComponentProps<"form">) {
	const navigate = useNavigate();
	const [error, setError] = useState<string | null>(null);
	const { signup, isLoading } = useAuth();

	const form = useAppForm({
		defaultValues: { email: "", password: "", confirmPassword: "", code: "" },
		validators: {
			onBlur: signupSchema,
		},
		onSubmit: async ({ value }) => {
			try {
				setError(null);
				await signup(value.email, value.code, value.password);
				navigate({ to: "/home" });
			} catch (error) {
				if (error instanceof Error) {
					setError(error.message);
				} else {
					setError("Une erreur inattendue est survenue");
				}
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
				<h1 className="text-2xl font-bold">Créez votre compte</h1>
				<p className="text-muted-foreground text-sm text-balance">
					Entrez votre email ci-dessous pour créer votre compte
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
						{(field) => (
							<field.EmailField label="Email :" placeholder="Email" />
						)}
					</form.AppField>
				</div>
				<div className="grid gap-3">
					<form.AppField name="code">
						{(field) => <field.TextField label="Code d&apos;activation :" />}
					</form.AppField>
				</div>
				<div className="grid gap-3">
					<form.AppField name="password">
						{(field) => <field.PasswordField label="Mot de passe :" />}
					</form.AppField>
				</div>
				<div className="grid gap-3">
					<form.AppField name="confirmPassword">
						{(field) => (
							<field.PasswordField label="Confirmer le mot de passe :" />
						)}
					</form.AppField>
				</div>

				<form.AppForm>
					<form.SubscribeButton label="Créer un compte" isLoading={isLoading} />
				</form.AppForm>
			</div>
			<div className="text-center text-sm">
				Vous avez déjà un compte ?{" "}
				<Link to="/auth/login" className="underline underline-offset-4">
					Connexion
				</Link>
			</div>
		</form>
	);
}
