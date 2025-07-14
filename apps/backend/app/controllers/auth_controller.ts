import type { HttpContext } from "@adonisjs/core/http";
import mail from "@adonisjs/mail/services/main";
import Invitation from "#models/invitation";
import User from "#models/user";
import env from "#start/env";
import {
	forgotPasswordValidator,
	loginValidator,
	registerValidator,
	resetPasswordValidator,
	signupValidator,
} from "#validators/auth";

export default class AuthController {
	async register({ request }: HttpContext) {
		const { email, password, schoolId } =
			await request.validateUsing(registerValidator);
		const user = await User.create({
			email,
			password,
			schoolId,
			role: "STUDENT",
			isActive: true,
			level: 1,
			points: 0,
			emailVerified: true,
		});
		return User.accessTokens.create(user);
	}

	async login({ request, response }: HttpContext) {
		const { email, password } = await request.validateUsing(loginValidator);

		const user = await User.findBy("email", email);
		if (!user) {
			return response.badRequest({
				message: "Adresse e-mail ou mot de passe incorrect.",
			});
		}

		try {
			await User.verifyCredentials(email, password);

			const token = await User.accessTokens.create(user, ["*"], {
				expiresIn: "7d",
			});

			return {
				token,
				user: {
					id: user.id,
					email: user.email,
					role: user.role,
					schoolId: user.schoolId,
					group: user.group,
				},
			};
		} catch (_error) {
			return response.badRequest({
				message: "Adresse e-mail ou mot de passe incorrect.",
			});
		}
	}

	async logout({ auth }: HttpContext) {
		const user = auth.user;
		if (!user || !user.currentAccessToken) {
			throw new Error("Not authenticated");
		}
		await User.accessTokens.delete(user, user.currentAccessToken.identifier);
		return { message: "Logged out successfully" };
	}

	async me({ auth }: HttpContext) {
		await auth.check();

		return {
			user: auth.user,
		};
	}

	async signup({ request, response }: HttpContext) {
		const { invitationCode, email, password } =
			await request.validateUsing(signupValidator);

		const invitation = await Invitation.findBy(
			"invitationCode",
			invitationCode,
		);
		if (!invitation) {
			return response.badRequest({ message: "Invalid invitation code" });
		}

		if (!invitation.isAvailable()) {
			return response.badRequest({
				message: invitation.isUsed
					? "This invitation code has already been used"
					: "This invitation code has expired",
			});
		}

		// Vérifier que l'email n'est pas déjà utilisé
		const existingUser = await User.findBy("email", email);
		if (existingUser) {
			return response.badRequest({
				message: "This email is already registered",
			});
		}

		// Créer l'utilisateur
		const user = await User.create({
			email,
			password,
			fullName: invitation.fullName,
			schoolId: invitation.schoolId,
			groupId: invitation.groupId,
			role: "STUDENT",
			isActive: true,
			level: 1,
			points: 0,
			emailVerified: true,
		});

		// Marquer l'invitation comme utilisée
		await invitation.markAsUsed(user.id);

		return User.accessTokens.create(user);
	}

	async forgotPassword({ request, response }: HttpContext) {
		const { email } = await request.validateUsing(forgotPasswordValidator);

		const user = await User.findBy("email", email);
		if (!user) {
			return response.ok({
				message: "If the email exists, a reset link has been sent",
			});
		}

		const resetToken = await user.generatePasswordResetToken();

		try {
			await mail.send((message) => {
				message.to(email);
				message.subject("Password Reset Request");
				message.html(`
          <p>Hello,</p>
          <p>You have requested a password reset. Please click the link below to reset your password:</p>
          <a href="${env.get("FRONTEND_URL", "http://localhost:3000")}/reset-password?token=${resetToken}">Reset Password</a>
        `);
			});
		} catch (error) {
			if (env.get("NODE_ENV") !== "test") {
				console.error("Failed to send password reset email:", error);
			}
		}

		return response.ok({
			message: "If the email exists, a reset link has been sent",
		});
	}

	async resetPassword({ request, response }: HttpContext) {
		const { token, password } = await request.validateUsing(
			resetPasswordValidator,
		);

		const user = await User.findBy("resetPasswordToken", token);
		if (!user || !user.isPasswordResetTokenValid(token)) {
			return response.badRequest({ message: "Invalid or expired reset token" });
		}

		user.password = password;
		await user.clearPasswordResetToken();
		await user.resetFailedAttempts();

		return response.ok({ message: "Password has been reset successfully" });
	}

	async logoutAllDevices({ auth, response }: HttpContext) {
		const user = auth.user;
		if (!user) {
			return response.unauthorized();
		}
		await User.accessTokens
			.all(user)
			.then((tokens) =>
				Promise.all(
					tokens.map((token) =>
						User.accessTokens.delete(user, token.identifier),
					),
				),
			);

		return response.ok({ message: "Logged out from all devices" });
	}
}
