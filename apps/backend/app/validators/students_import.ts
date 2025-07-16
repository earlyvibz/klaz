import vine from "@vinejs/vine";

export const importStudentsValidator = vine.compile(
	vine.object({
		csv_file: vine.file({
			size: "2mb",
			extnames: ["csv"],
		}),
	}),
);
