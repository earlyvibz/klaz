import { z } from "zod";

export const questSubmissionSchema = z.object({
	file: z
		.instanceof(File)
		.refine((file) => file.size > 0, {
			message: "Vous devez sélectionner un fichier",
		})
		.refine((file) => file.size <= 5 * 1024 * 1024, {
			message: "Le fichier ne doit pas dépasser 5MB",
		})
		.refine(
			(file) => {
				const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
				return allowedTypes.includes(file.type);
			},
			{
				message: "Format de fichier non supporté",
			},
		),
	description: z.string(),
});
