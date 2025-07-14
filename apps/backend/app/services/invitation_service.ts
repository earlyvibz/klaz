/** biome-ignore-all lint/complexity/noStaticOnlyClass: false positive */
import mail from "@adonisjs/mail/services/main";
import type Invitation from "#models/invitation";
import env from "#start/env";

export default class InvitationService {
	static async sendInvitationEmail(invitation: Invitation): Promise<boolean> {
		try {
			await mail.send((message) => {
				message.to(invitation.schoolEmail);
				message.subject("Invitation à rejoindre la plateforme Klaz");
				message.html(`
          <h2>Invitation à rejoindre Klaz</h2>
          <p>Bonjour ${invitation.fullName || "Étudiant"},</p>
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
			if (env.get("NODE_ENV") !== "test") {
				console.error(
					`Failed to send invitation email to ${invitation.schoolEmail}:`,
					error,
				);
			}
			return false;
		}
	}

	static async sendBulkInvitations(invitations: Invitation[]): Promise<{
		sent: number;
		failed: string[];
	}> {
		const results = await Promise.allSettled(
			invitations.map(InvitationService.sendInvitationEmail),
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
