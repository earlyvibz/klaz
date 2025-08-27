import type { HttpContext } from "@adonisjs/core/http";
import app from "@adonisjs/core/services/app";
import mail from "@adonisjs/mail/services/main";
import { v4 as uuidv4 } from "uuid";
import InvitationDto from "#dtos/invitation";
import Invitation from "#models/invitation";
import env from "#start/env";

export default class InvitationsController {
	async import({ request, response, school }: HttpContext) {
		const csvFile = request.file("csv_file");
		if (!csvFile) {
			return response.badRequest({ message: "CSV file required" });
		}

		await csvFile.move(app.makePath("tmp/uploads"), {
			name: `${uuidv4()}.csv`,
		});

		if (!csvFile.filePath) {
			return response.badRequest({ message: "CSV file not found" });
		}

		const fs = await import("node:fs/promises");
		const csvText = await fs.readFile(csvFile.filePath, "utf-8");
		const lines = csvText.split("\n").filter((line) => line.trim());

		if (lines.length < 2) {
			return response.badRequest({
				message: "CSV must contain header + students",
			});
		}

		const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
		const emailIndex = headers.findIndex((h) => h.includes("email"));
		const nameIndex = headers.findIndex(
			(h) => h.includes("name") || h.includes("nom"),
		);

		if (emailIndex === -1) {
			return response.badRequest({ message: "CSV must contain email column" });
		}

		const results: {
			created: number;
			skipped: number;
			errors: string[];
		} = { created: 0, skipped: 0, errors: [] };

		for (let i = 1; i < lines.length; i++) {
			const values = lines[i].split(",").map((v) => v.trim());
			const email = values[emailIndex];
			const fullName = nameIndex !== -1 ? values[nameIndex] : null;

			if (!email?.includes("@")) {
				results.errors.push(`Line ${i + 1}: Invalid email "${email}"`);
				continue;
			}

			// Check if exists
			const existing = await Invitation.query()
				.where("schoolEmail", email)
				.where("schoolId", school?.id ?? "")
				.first();

			if (existing) {
				results.skipped++;
				continue;
			}

			// Split name
			const nameParts = fullName?.split(" ") || [];
			const firstName = nameParts[0] || null;
			const lastName = nameParts.slice(1).join(" ") || null;

			// Create invitation
			const invitation = await Invitation.create({
				schoolEmail: email,
				firstName,
				lastName,
				invitationCode: uuidv4(),
				schoolId: school?.id ?? "",
				isUsed: false,
				// ❌ Plus d'expiresAt !
			});

			// Send email
			await this.sendEmail(invitation);
			results.created++;
		}

		return response.ok({
			message: `Import completed: ${results.created} created, ${results.skipped} skipped`,
			...results,
		});
	}

	async index({ response, school }: HttpContext) {
		const invitations = await Invitation.query()
			.where("schoolId", school?.id ?? "")
			.preload("user")
			.orderBy("createdAt", "desc");

		return response.ok({
			invitations: invitations.map((inv) => new InvitationDto(inv)),
		});
	}

	async resend({ params, response, school }: HttpContext) {
		const invitation = await Invitation.query()
			.where("id", params.id)
			.where("schoolId", school?.id ?? "")
			.first();

		if (!invitation) {
			return response.notFound({ message: "Invitation not found" });
		}

		if (invitation.isUsed) {
			return response.badRequest({ message: "Cannot resend used invitation" });
		}

		await this.sendEmail(invitation);
		return response.ok({ message: "Invitation resent" });
	}

	async destroy({ params, response, school }: HttpContext) {
		const invitation = await Invitation.query()
			.where("id", params.id)
			.where("schoolId", school?.id ?? "")
			.first();

		if (!invitation) {
			return response.notFound({ message: "Invitation not found" });
		}

		if (invitation.isUsed) {
			return response.badRequest({ message: "Cannot delete used invitation" });
		}

		await invitation.delete();
		return response.ok({ message: "Invitation deleted" });
	}

	private async sendEmail(invitation: Invitation): Promise<void> {
		await mail.send((message) => {
			message.to(invitation.schoolEmail);
			message.subject("Invitation Klaz");
			message.html(`
        <h2>Invitation à rejoindre Klaz</h2>
        <p>Bonjour ${invitation.firstName || ""},</p>
        <p>Vous avez été invité à rejoindre la plateforme Klaz.</p>
        <p><strong>Code d'invitation :</strong> ${invitation.invitationCode}</p>
        <p><a href="${env.get("FRONTEND_URL")}/signup?code=${invitation.invitationCode}">Créer mon compte</a></p>
      `);
		});
	}
}
