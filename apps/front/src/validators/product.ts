import { z } from "zod";

export const createProductSchema = z.object({
	title: z
		.string()
		.min(3, "Le titre doit contenir au moins 3 caractères")
		.max(255, "Le titre ne peut pas dépasser 255 caractères"),
	description: z.string().min(1, "La description est requise"),
	image: z
		.instanceof(File)
		.refine((file) => file.size === 0 || file.size <= 5 * 1024 * 1024, {
			message: "Le fichier ne doit pas dépasser 5MB",
		})
		.refine(
			(file) => {
				if (file.size === 0) return true; // Empty file is allowed (optional)
				const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
				return allowedTypes.includes(file.type);
			},
			{
				message: "Format de fichier non supporté",
			},
		),
	pricePoints: z
		.number()
		.min(1, "Le prix doit être d'au moins 1 point")
		.int("Le prix doit être un nombre entier"),
	supply: z
		.number()
		.min(0, "Le stock ne peut pas être négatif")
		.int("Le stock doit être un nombre entier"),
	maxQuantityPerStudent: z
		.number()
		.min(1, "La limite doit être d'au moins 1")
		.int("La limite doit être un nombre entier")
		.optional(),
});
