import vine from "@vinejs/vine";

export const registerValidator = vine.compile(
	vine.object({
		email: vine
			.string()
			.email()
			.normalizeEmail()
			.unique(async (db, value) => {
				const user = await db
					.query()
					.from("users")
					.select("id")
					.where("email", value)
					.first();
				return !user;
			}),
		password: vine
			.string()
			.minLength(8)
			.regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/),
		schoolId: vine.string().uuid(),
	}),
);

export const loginValidator = vine.compile(
	vine.object({
		email: vine.string().email().normalizeEmail(),
		password: vine.string().minLength(8),
	}),
);

export const signupValidator = vine.compile(
	vine.object({
		invitationCode: vine.string().uuid(),
		password: vine
			.string()
			.minLength(8)
			.regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/),
	}),
);

export const forgotPasswordValidator = vine.compile(
	vine.object({
		email: vine.string().email().normalizeEmail(),
	}),
);

export const resetPasswordValidator = vine.compile(
	vine.object({
		token: vine.string().uuid(),
		password: vine
			.string()
			.minLength(8)
			.regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/),
	}),
);
