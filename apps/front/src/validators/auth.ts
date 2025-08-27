import { z } from "zod";

export const signupSchema = z
	.object({
		email: z.string().email("Email invalide"),
		password: z.string().min(8, "Mot de passe trop court"),
		confirmPassword: z.string().min(8, "Mot de passe trop court"),
		code: z.string().min(6, "Code invalide"),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Les mots de passe ne correspondent pas",
		path: ["confirmPassword"],
	});

export const loginSchema = z.object({
	email: z.string().email("Email invalide"),
	password: z.string().min(8, "Mot de passe trop court"),
});

export const changePasswordSchema = z
	.object({
		currentPassword: z.string().min(1, "Mot de passe actuel requis"),
		newPassword: z
			.string()
			.min(6, "Le nouveau mot de passe doit contenir au moins 6 caractères"),
		confirmPassword: z.string().min(6, "Confirmation requise"),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: "Les mots de passe ne correspondent pas",
		path: ["confirmPassword"],
	});
