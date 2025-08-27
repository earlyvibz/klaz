import type { HttpContext } from "@adonisjs/core/http";
import mail from "@adonisjs/mail/services/main";
import UserDto from "#dtos/user";
import Invitation from "#models/invitation";
import User from "#models/user";
import env from "#start/env";

export default class AuthController {
	async login({ request, auth, response }: HttpContext) {
		const { email, password } = request.only(["email", "password"]);
		const user = await User.verifyCredentials(email, password);
		const origin = request.header("origin") ?? "";
		const hostname = origin.replace(/^https?:\/\//, "");
		const subdomain = hostname.split(".")[0] ?? "";

		await user.load("school");

		if (user.school?.slug !== subdomain) {
			return response.badRequest({
				errors: [
					{
						message:
							"Vous devriez vous connecter depuis le portail de votre école.",
					},
				],
			});
		}

		await auth.use("web").login(user);

		if (!user.isSuperAdmin()) {
			await user.load("school");
		}

		return {
			user: new UserDto(user),
		};
	}

	async me({ auth }: HttpContext) {
		return new UserDto(auth.user);
	}

	async signup({ request, response, school }: HttpContext) {
		const { invitationCode, email, password } = request.only([
			"invitationCode",
			"email",
			"password",
		]);

		// Chercher l'invitation dans l'école courante
		const invitation = await Invitation.query()
			.where("invitationCode", invitationCode)
			.where("schoolId", school?.id ?? "")
			.first();

		if (!invitation) {
			return response.badRequest({
				errors: [
					{
						message: "Code d'invitation invalide",
					},
				],
			});
		}

		if (!invitation.isAvailable()) {
			return response.badRequest({
				errors: [
					{
						message: "Ce code d'invitation a déjà été utilisé",
					},
				],
			});
		}

		try {
			// Créer l'utilisateur
			const user = await User.create({
				email,
				password,
				firstName: invitation.firstName,
				lastName: invitation.lastName,
				schoolId: invitation.schoolId,
				role: "STUDENT",
				isActive: true,
				emailVerified: true,
				level: 1,
				points: 0,
			});

			// Marquer l'invitation comme utilisée
			await invitation.markAsUsed(user.id);

			// Charger la relation school
			await user.load("school");

			return new UserDto(user);
		} catch (error) {
			console.error("Signup error:", error);

			// Gérer l'erreur d'email déjà existant
			if (error.code === "23505" || error.message.includes("unique")) {
				return response.badRequest({ message: "Cet email est déjà utilisé" });
			}

			return response.internalServerError({
				message: "Une erreur est survenue lors de l'inscription",
			});
		}
	}

	async forgotPassword({ request, response }: HttpContext) {
		const { email } = request.only(["email"]);

		const user = await User.query().where("email", email).first();
		if (!user) {
			return response.ok({
				message: "If the email exists, a reset link has been sent",
			});
		}

		const resetToken = await user.generatePasswordResetToken();

		try {
			await mail.send((message) => {
				message.to(email);
				message.subject("Réinitialiser le mot de passe");
				message.html(`
          <p>Hello,</p>
          <p>You have requested a password reset. Please click the link below to reset your password:</p>
          <a href="${env.get(
						"FRONTEND_URL",
						"http://localhost:3000",
					)}/reset-password?token=${resetToken}">Reset Password</a>
        `);
			});
		} catch (error) {
			console.error("Failed to send password reset email:", error);
		}

		return response.ok({
			message: "If the email exists, a reset link has been sent",
		});
	}

	async resetPassword({ request, response }: HttpContext) {
		const { token, password } = request.only(["token", "password"]);

		const user = await User.query().where("resetPasswordToken", token).first();
		if (!user || !user.isPasswordResetTokenValid(token)) {
			return response.badRequest({ message: "Invalid or expired reset token" });
		}

		user.password = password;
		await user.clearPasswordResetToken();

		return response.ok({ message: "Password has been reset successfully" });
	}

	async logout({ auth, response }: HttpContext) {
		await auth.use("web").logout();

		return response.ok({ message: "Logged out" });
	}

	async changePassword({ auth, request, response }: HttpContext) {
		if (!auth.user) {
			return response.unauthorized({ message: "Unauthorized" });
		}

		const user = auth.user;

		const { currentPassword, newPassword } = request.only([
			"currentPassword",
			"newPassword",
		]);

		try {
			const isValidPassword = await User.verifyCredentials(
				user.email,
				currentPassword,
			);
			if (!isValidPassword) {
				return response.badRequest({
					errors: [{ message: "Mot de passe actuel incorrect" }],
				});
			}

			user.password = newPassword;
			await user.save();

			return response.ok({ message: "Mot de passe modifié avec succès" });
		} catch (error) {
			console.error("Change password error:", error);
			return response.internalServerError({
				message: "Une erreur est survenue lors du changement de mot de passe",
			});
		}
	}

	async deleteAccount({ auth, response }: HttpContext) {
		if (!auth.user) {
			return response.unauthorized({ message: "Unauthorized" });
		}
		const user = auth.user;

		try {
			await user.delete();
			await auth.use("web").logout();

			return response.ok({ message: "Compte supprimé avec succès" });
		} catch (error) {
			console.error("Delete account error:", error);
			return response.internalServerError({
				message: "Une erreur est survenue lors de la suppression du compte",
			});
		}
	}
}
