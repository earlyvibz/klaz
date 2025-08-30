import vine from "@vinejs/vine";

export const createQuestValidator = vine.compile(
	vine.object({
		title: vine.string().trim().minLength(3).maxLength(255),
		description: vine.string().trim().minLength(1),
		type: vine.string().trim().optional(),
		points: vine.number().min(0).optional(),
		deadline: vine.string().optional(),
		validationType: vine.enum(["MANUAL", "AUTO_API"]).optional(),
	}),
);

export const updateQuestValidator = vine.compile(
	vine.object({
		title: vine.string().trim().minLength(3).maxLength(255).optional(),
		description: vine.string().trim().optional(),
		type: vine.string().trim().optional(),
		points: vine.number().min(0).optional(),
		deadline: vine.date().optional(),
		validationType: vine.enum(["MANUAL", "AUTO_API"]).optional(),
		isActive: vine.boolean().optional(),
	}),
);

export const submitQuestValidator = vine.compile(
	vine.object({
		proofUrl: vine.string().trim().url().optional(),
	}),
);

export const reviewSubmissionValidator = vine.compile(
	vine.object({
		feedback: vine.string().trim().optional(),
	}),
);
