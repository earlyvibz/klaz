import vine from "@vinejs/vine";

export const createProductValidator = vine.compile(
	vine.object({
		title: vine.string().trim().minLength(3).maxLength(255),
		description: vine.string().trim(),
		image: vine.file(),
		pricePoints: vine.number().min(1),
		supply: vine.number().min(0),
		maxQuantityPerStudent: vine.number().min(1).optional(),
	}),
);

export const updateProductValidator = vine.compile(
	vine.object({
		title: vine.string().trim().minLength(3).maxLength(255).optional(),
		description: vine.string().trim().optional(),
		image: vine.file().optional(),
		pricePoints: vine.number().min(1).optional(),
		supply: vine.number().min(0).optional(),
		maxQuantityPerStudent: vine.number().min(1).optional(),
		isActive: vine.boolean().optional(),
	}),
);

export const purchaseProductValidator = vine.compile(
	vine.object({
		quantity: vine.number().min(1).optional(),
	}),
);
