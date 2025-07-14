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
