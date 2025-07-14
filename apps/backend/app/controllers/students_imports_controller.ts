import type { HttpContext } from "@adonisjs/core/http";
import app from "@adonisjs/core/services/app";
import { DateTime } from "luxon";
import { v4 as uuidv4 } from "uuid";
import Invitation from "#models/invitation";
import InvitationService from "#services/invitation_service";
import { importStudentsValidator } from "#validators/students_import";

export default class StudentsImportsController {
	async import({ request, auth, response }: HttpContext) {
		const { csv_file: csvFile } = await request.validateUsing(
			importStudentsValidator,
		);

		const user = auth.user;
		if (!user) {
			return response.unauthorized({ message: "User not authenticated" });
		}
		const schoolId = user.schoolId;

		try {
			await csvFile.move(app.makePath("tmp/uploads"), {
				name: `${uuidv4()}.csv`,
			});

			if (!csvFile.filePath) {
				return response.internalServerError({
					message: "Failed to process uploaded file",
				});
			}

			const fs = await import("node:fs/promises");
			const csvText = await fs.readFile(csvFile.filePath, "utf-8");
			const lines = csvText.split("\n").filter((line: string) => line.trim());

			if (lines.length < 2) {
				return response.badRequest({
					message: "CSV must contain at least a header and one student",
				});
			}

			const headers = lines[0]
				.split(",")
				.map((h: string) => h.trim().toLowerCase());
			const emailIndex = headers.findIndex((h: string) => h.includes("email"));
			const nameIndex = headers.findIndex(
				(h: string) => h.includes("name") || h.includes("nom"),
			);

			if (emailIndex === -1) {
				return response.badRequest({
					message: "CSV must contain an email column",
				});
			}

			const invitationsData = [];
			const errors: string[] = [];

			for (let i = 1; i < lines.length; i++) {
				const values = lines[i].split(",").map((v: string) => v.trim());

				if (values.length < headers.length) continue;

				const schoolEmail = values[emailIndex];
				const fullName = nameIndex !== -1 ? values[nameIndex] : null;

				if (!schoolEmail || !schoolEmail.includes("@")) {
					errors.push(`Line ${i + 1}: Invalid email "${schoolEmail}"`);
					continue;
				}

				const existingInvitation = await Invitation.findBy(
					"schoolEmail",
					schoolEmail,
				);
				if (existingInvitation) {
					errors.push(
						`Line ${i + 1}: Invitation for email "${schoolEmail}" already exists`,
					);
					continue;
				}

				invitationsData.push({
					schoolEmail,
					fullName,
					invitationCode: uuidv4(),
					schoolId,
					isUsed: false,
					expiresAt: DateTime.now().plus({ days: 30 }),
				});
			}

			if (invitationsData.length === 0) {
				return response.badRequest({
					message: "No valid invitations to create",
					errors,
				});
			}

			const createdInvitations = await Invitation.createMany(invitationsData);

			// Envoyer les emails d'invitation
			const { sent, failed } =
				await InvitationService.sendBulkInvitations(createdInvitations);

			return response.ok({
				message: `Successfully created ${createdInvitations.length} invitations`,
				created: createdInvitations.length,
				emailsSent: sent,
				errors: errors.length > 0 ? errors : null,
				emailErrors: failed.length > 0 ? failed : null,
				invitations: createdInvitations.map((invitation) => ({
					id: invitation.id,
					schoolEmail: invitation.schoolEmail,
					fullName: invitation.fullName,
					invitationCode: invitation.invitationCode,
					expiresAt: invitation.expiresAt,
				})),
			});
		} catch (error) {
			return response.internalServerError({
				message: "Error processing CSV file",
				error: error.message,
			});
		}
	}
}
