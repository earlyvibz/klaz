import { z } from "zod/v4";

export const loginSchema = z.object({
	email: z.string().email("Email invalide"),
	password: z.string().min(8, "Mot de passe trop court"),
});
