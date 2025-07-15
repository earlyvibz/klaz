import type { HttpContext } from "@adonisjs/core/http";
import app from "@adonisjs/core/services/app";
import mail from "@adonisjs/mail/services/main";
import { DateTime } from "luxon";
import { v4 as uuidv4 } from "uuid";
import Invitation from "#models/invitation";
import env from "#start/env";
import { importStudentsValidator } from "#validators/students_import";

export default class InvitationsController {
	// Helper function to split fullName into firstName and lastName
	private splitName(fullName: string | null): {
		firstName: string | null;
		lastName: string | null;
	} {
		if (!fullName) return { firstName: null, lastName: null };
		const parts = fullName.trim().split(" ");
		const firstName = parts[0] || null;
		const lastName = parts.length > 1 ? parts.slice(1).join(" ") : null;
		return { firstName, lastName };
	}

	async import({ request, auth, response }: HttpContext) {
		const { csv_file: csvFile } = await request.validateUsing(
			importStudentsValidator,
		);

		const user = auth.user;
		if (!user) {
			return response.unauthorized({ message: "User not authenticated" });
		}

		if (!user.schoolId) {
			return response.forbidden({
				message: "User is not associated with a school",
			});
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
				const { firstName, lastName } = this.splitName(fullName);

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
					firstName,
					lastName,
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
				await InvitationsController.sendBulkInvitations(createdInvitations);

			return response.ok({
				message: `Successfully created ${createdInvitations.length} invitations`,
				created: createdInvitations.length,
				emailsSent: sent,
				errors: errors.length > 0 ? errors : null,
				emailErrors: failed.length > 0 ? failed : null,
				invitations: createdInvitations.map((invitation) => ({
					id: invitation.id,
					schoolEmail: invitation.schoolEmail,
					firstName: invitation.firstName,
					lastName: invitation.lastName,
					displayName: invitation.displayName,
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

	async index({ auth, response }: HttpContext) {
		const user = auth.user;
		if (!user) {
			return response.unauthorized({ message: "User not authenticated" });
		}

		if (!user.schoolId) {
			return response.forbidden({
				message: "User is not associated with a school",
			});
		}

		const invitations = await Invitation.query()
			.where("schoolId", user.schoolId)
			.preload("user")
			.orderBy("createdAt", "desc");

		return response.ok({
			invitations: invitations.map((invitation) => {
				const userData = invitation.user
					? {
							exists: true,
							isActive: invitation.user.isActive,
							registeredAt: invitation.user.createdAt,
							id: invitation.user.id,
							email: invitation.user.email,
							level: invitation.user.level,
							points: invitation.user.points,
						}
					: {
							exists: false,
							isActive: null,
							registeredAt: null,
							id: null,
							email: null,
							level: null,
							points: null,
						};

				return {
					id: invitation.id,
					schoolEmail: invitation.schoolEmail,
					firstName: invitation.firstName,
					lastName: invitation.lastName,
					displayName: invitation.displayName,
					invitationCode: invitation.invitationCode,
					isUsed: invitation.isUsed,
					expiresAt: invitation.expiresAt,
					createdAt: invitation.createdAt,
					user: userData,
					status: invitation.isUsed
						? userData.exists
							? userData.isActive
								? "ACTIVE"
								: "INACTIVE"
							: "ERROR"
						: invitation.isExpired()
							? "EXPIRED"
							: "PENDING",
				};
			}),
		});
	}

	async stats({ auth, response }: HttpContext) {
		const user = auth.user;
		if (!user) {
			return response.unauthorized({ message: "User not authenticated" });
		}

		if (!user.schoolId) {
			return response.forbidden({
				message: "User is not associated with a school",
			});
		}

		const invitations = await Invitation.query()
			.where("schoolId", user.schoolId)
			.preload("user");

		const now = DateTime.now();

		const stats = {
			total: invitations.length,
			pending: 0,
			used: 0,
			expired: 0,
			activeUsers: 0,
			inactiveUsers: 0,
			conversionRate: 0,
		};

		invitations.forEach((invitation) => {
			if (invitation.isUsed) {
				stats.used++;
				if (invitation.user) {
					if (invitation.user.isActive) {
						stats.activeUsers++;
					} else {
						stats.inactiveUsers++;
					}
				}
			} else if (invitation.expiresAt && invitation.expiresAt < now) {
				stats.expired++;
			} else {
				stats.pending++;
			}
		});

		stats.conversionRate =
			stats.total > 0 ? Math.round((stats.used / stats.total) * 100) : 0;

		return response.ok({ stats });
	}

	async show({ params, auth, response }: HttpContext) {
		const user = auth.user;
		if (!user) {
			return response.unauthorized({ message: "User not authenticated" });
		}

		if (!user.schoolId) {
			return response.forbidden({
				message: "User is not associated with a school",
			});
		}

		let invitation: Invitation | null;
		try {
			invitation = await Invitation.query()
				.where("id", params.id)
				.where("schoolId", user.schoolId)
				.first();
		} catch (_error) {
			return response.notFound({ message: "Invitation not found" });
		}

		if (!invitation) {
			return response.notFound({ message: "Invitation not found" });
		}

		return response.ok({ invitation });
	}

	async destroy({ params, auth, response }: HttpContext) {
		const user = auth.user;
		if (!user) {
			return response.unauthorized({ message: "User not authenticated" });
		}

		if (!user.schoolId) {
			return response.forbidden({
				message: "User is not associated with a school",
			});
		}

		let invitation: Invitation | null;
		try {
			invitation = await Invitation.query()
				.where("id", params.id)
				.where("schoolId", user.schoolId)
				.first();
		} catch (_error) {
			return response.notFound({ message: "Invitation not found" });
		}

		if (!invitation) {
			return response.notFound({ message: "Invitation not found" });
		}

		if (invitation.isUsed) {
			return response.badRequest({ message: "Cannot delete used invitation" });
		}

		await invitation.delete();

		return response.ok({ message: "Invitation deleted successfully" });
	}

	async resend({ params, auth, response }: HttpContext) {
		const user = auth.user;
		if (!user) {
			return response.unauthorized({ message: "User not authenticated" });
		}

		if (!user.schoolId) {
			return response.forbidden({
				message: "User is not associated with a school",
			});
		}

		let invitation: Invitation | null;
		try {
			invitation = await Invitation.query()
				.where("id", params.id)
				.where("schoolId", user.schoolId)
				.first();
		} catch (_error) {
			return response.notFound({ message: "Invitation not found" });
		}

		if (!invitation) {
			return response.notFound({ message: "Invitation not found" });
		}

		if (invitation.isUsed) {
			return response.badRequest({ message: "Cannot resend used invitation" });
		}

		const emailSent =
			await InvitationsController.sendInvitationEmail(invitation);

		if (!emailSent) {
			return response.internalServerError({
				message: "Failed to send invitation email",
			});
		}

		return response.ok({ message: "Invitation resent successfully" });
	}

	static async sendInvitationEmail(invitation: Invitation): Promise<boolean> {
		try {
			await mail.send((message) => {
				message.to(invitation.schoolEmail);
				message.subject("Invitation à rejoindre la plateforme Klaz");
				message.html(`
          <h2>Invitation à rejoindre Klaz</h2>
          <p>Bonjour ${invitation.displayName || "Étudiant"},</p>
          <p>Vous avez été invité à rejoindre la plateforme Klaz.</p>
          <p>Pour créer votre compte, cliquez sur le lien suivant et utilisez le code d'invitation :</p>
          <p><strong>Code d'invitation :</strong> ${invitation.invitationCode}</p>
          <p><a href="${env.get("FRONTEND_URL", "http://localhost:3000")}/auth/signup?code=${invitation.invitationCode}">Créer mon compte</a></p>
          <p>Cette invitation expire le ${invitation.expiresAt?.toFormat("dd/MM/yyyy")}.</p>
          <p>Vous pourrez utiliser l'email de votre choix pour créer votre compte.</p>
          <p>L'équipe Klaz</p>
        `);
			});
			return true;
		} catch (error) {
			console.error(
				`Failed to send invitation email to ${invitation.schoolEmail}:`,
				error,
			);

			return false;
		}
	}

	static async sendBulkInvitations(invitations: Invitation[]): Promise<{
		sent: number;
		failed: string[];
	}> {
		const results = await Promise.allSettled(
			invitations.map(InvitationsController.sendInvitationEmail),
		);

		const failed: string[] = [];
		let sent = 0;

		results.forEach((result, index) => {
			if (result.status === "rejected" || !result.value) {
				failed.push(
					`Failed to send email to ${invitations[index].schoolEmail}`,
				);
			} else {
				sent++;
			}
		});

		return { sent, failed };
	}
}
