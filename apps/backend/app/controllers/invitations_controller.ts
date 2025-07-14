import type { HttpContext } from "@adonisjs/core/http";
import Invitation from "#models/invitation";
import InvitationService from "#services/invitation_service";

export default class InvitationsController {
	async index({ auth, response }: HttpContext) {
		const user = auth.user;
		if (!user) {
			return response.unauthorized({ message: "User not authenticated" });
		}

		const invitations = await Invitation.query()
			.where("schoolId", user.schoolId)
			.preload("user", (userQuery) => {
				userQuery.select("id", "email", "fullName");
			})
			.orderBy("createdAt", "desc");

		return response.ok({
			invitations: invitations.map((invitation) => ({
				id: invitation.id,
				schoolEmail: invitation.schoolEmail,
				fullName: invitation.fullName,
				invitationCode: invitation.invitationCode,
				isUsed: invitation.isUsed,
				user: invitation.user,
				expiresAt: invitation.expiresAt,
				createdAt: invitation.createdAt,
			})),
		});
	}

	async show({ params, auth, response }: HttpContext) {
		const user = auth.user;
		if (!user) {
			return response.unauthorized({ message: "User not authenticated" });
		}

		const invitation = await Invitation.query()
			.where("id", params.id)
			.where("schoolId", user.schoolId)
			.preload("user")
			.first();

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

		const invitation = await Invitation.query()
			.where("id", params.id)
			.where("schoolId", user.schoolId)
			.first();

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

		const invitation = await Invitation.query()
			.where("id", params.id)
			.where("schoolId", user.schoolId)
			.first();

		if (!invitation) {
			return response.notFound({ message: "Invitation not found" });
		}

		if (invitation.isUsed) {
			return response.badRequest({ message: "Cannot resend used invitation" });
		}

		const emailSent = await InvitationService.sendInvitationEmail(invitation);

		if (!emailSent) {
			return response.internalServerError({
				message: "Failed to send invitation email",
			});
		}

		return response.ok({ message: "Invitation resent successfully" });
	}
}
