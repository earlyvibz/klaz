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

export const createQuestSchema = z.object({
	title: z
		.string()
		.min(3, "Le titre doit contenir au moins 3 caractères")
		.max(255, "Le titre ne doit pas dépasser 255 caractères"),
	description: z.string().min(1, "La description est obligatoire"),
	type: z.string(),
	points: z.number().min(1, "Les points doivent être d'au moins 1"),
	deadline: z.date().nullable(),
	validationType: z.enum(["MANUAL", "AUTO_API"]),
});
