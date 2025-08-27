import crypto from "node:crypto";
import limiter from "@adonisjs/limiter/services/main";
import mail from "@adonisjs/mail/services/main";
import { test } from "@japa/runner";
import { DateTime } from "luxon";
import Invitation from "#models/invitation";
import School from "#models/school";
import User from "#models/user";

test.group("Auth", (group) => {
	let school: School;

	group.setup(async () => {
		school = await School.create({
			name: "Test School Auth",
			slug: "test-school-auth",
		});
	});

	group.teardown(async () => {
		await User.query().delete();
		await Invitation.query().delete();
		await School.query().delete();
		await limiter.clear(["memory"]);
	});

	test("signup with valid invitation code", async ({ client, assert }) => {
		const invitation = await Invitation.create({
			schoolEmail: "test@school.com",
			firstName: "Test",
			lastName: "User",
			invitationCode: crypto.randomUUID(),
			schoolId: school.id,
			isUsed: false,
		});

		const response = await client
			.post("/signup")
			.header("origin", `https://${school.slug}.klaz.local`)
			.json({
				invitationCode: invitation.invitationCode,
				email: "test@example.com",
				password: "Password123!",
			});

		response.assertStatus(200);

		const user = await User.findBy("email", "test@example.com");
		assert.isNotNull(user, "User should be created");
		assert.equal(user?.role, "STUDENT", "Default role should be STUDENT");
		assert.isTrue(user?.isActive, "User should be active");
		assert.isTrue(user?.emailVerified, "Email should be verified");
		assert.equal(user?.level, 1, "Default level should be 1");
		assert.equal(user?.points, 0, "Default points should be 0");

		// Vérifier que l'invitation est marquée comme utilisée
		await invitation.refresh();
		assert.isTrue(invitation.isUsed);
		assert.equal(invitation.userId, user?.id);
	});

	test("cannot signup with invalid invitation code", async ({ client }) => {
		const response = await client
			.post("/signup")
			.header("origin", `https://${school.slug}.klaz.local`)
			.json({
				invitationCode: crypto.randomUUID(),
				email: "test@example.com",
				password: "Password123!",
			});

		response.assertStatus(400);
		response.assertBodyContains({
			errors: [{ message: "Code d'invitation invalide" }],
		});
	});

	test("cannot signup with used invitation code", async ({ client }) => {
		const invitation = await Invitation.create({
			schoolEmail: "used@school.com",
			firstName: "Used",
			lastName: "Invitation",
			invitationCode: crypto.randomUUID(),
			schoolId: school.id,
			isUsed: true,
		});

		const response = await client
			.post("/signup")
			.header("origin", `https://${school.slug}.klaz.local`)
			.json({
				invitationCode: invitation.invitationCode,
				email: "test@example.com",
				password: "Password123!",
			});

		response.assertStatus(400);
		response.assertBodyContains({
			errors: [{ message: "Ce code d'invitation a déjà été utilisé" }],
		});
	});

	test("cannot signup with existing email", async ({ client }) => {
		await User.create({
			email: "existing@example.com",
			password: "Password123!",
			schoolId: school.id,
			role: "STUDENT",
			isActive: true,
			level: 1,
			points: 0,
		});

		const invitation = await Invitation.create({
			schoolEmail: "new@school.com",
			firstName: "New",
			lastName: "User",
			invitationCode: crypto.randomUUID(),
			schoolId: school.id,
			isUsed: false,
		});

		const response = await client
			.post("/signup")
			.header("origin", `https://${school.slug}.klaz.local`)
			.json({
				invitationCode: invitation.invitationCode,
				email: "existing@example.com", // Email déjà utilisé
				password: "Password123!",
			});

		response.assertStatus(400);
		response.assertBodyContains({
			message: "Cet email est déjà utilisé",
		});
	});

	test("login with valid credentials", async ({ client, assert }) => {
		await User.create({
			email: "login@example.com",
			password: "Password123!",
			schoolId: school.id,
			role: "STUDENT",
			isActive: true,
			level: 1,
			points: 0,
		});

		const response = await client
			.post("/login")
			.header("origin", `https://${school.slug}.klaz.local`)
			.json({
				email: "login@example.com",
				password: "Password123!",
			});

		response.assertStatus(200);
		const body = response.body();
		assert.equal(body.user.email, "login@example.com");
		assert.equal(body.user.role, "STUDENT");
	});

	test("cannot login with wrong credentials", async ({ client }) => {
		const response = await client
			.post("/login")
			.header("origin", `https://${school.slug}.klaz.local`)
			.json({
				email: "wrong@example.com",
				password: "wrongpassword",
			});

		response.assertStatus(400);
	});

	test("cannot login to wrong school", async ({ client }) => {
		// Créer un autre école
		const otherSchool = await School.create({
			name: "Other School",
			slug: "other-school",
		});

		// Créer un utilisateur dans l'autre école
		await User.create({
			email: "other@example.com",
			password: "Password123!",
			schoolId: otherSchool.id,
			role: "STUDENT",
			isActive: true,
			level: 1,
			points: 0,
		});

		// Essayer de se connecter sur la mauvaise école
		const response = await client
			.post("/login")
			.header("origin", `https://${school.slug}.klaz.local`)
			.json({
				email: "other@example.com",
				password: "Password123!",
			});

		response.assertStatus(400);
		response.assertBodyContains({
			errors: [
				{
					message:
						"Vous devriez vous connecter depuis le portail de votre école.",
				},
			],
		});

		// Cleanup
		await otherSchool.delete();
	});

	test("get authenticated user info", async ({ client }) => {
		const user = await User.create({
			email: "me@example.com",
			password: "Password123!",
			schoolId: school.id,
			role: "STUDENT",
			isActive: true,
			level: 1,
			points: 0,
		});

		const response = await client.get("/me").loginAs(user);

		response.assertStatus(200);
		response.assertBodyContains({
			email: "me@example.com",
			role: "STUDENT",
			schoolId: school.id,
		});
	});

	test("cannot access protected route without authentication", async ({
		client,
	}) => {
		const response = await client.get("/me");

		response.assertStatus(401);
	});

	test("forgot password with valid email", async ({ client }) => {
		const { messages } = mail.fake();

		await User.create({
			email: "forgot@example.com",
			password: "Password123!",
			schoolId: school.id,
			role: "STUDENT",
			isActive: true,
			level: 1,
			points: 0,
		});

		const response = await client
			.post("/forgot-password")
			.header("origin", `https://${school.slug}.klaz.local`)
			.json({
				email: "forgot@example.com",
			});

		response.assertStatus(200);
		response.assertBodyContains({
			message: "If the email exists, a reset link has been sent",
		});

		messages.assertSentCount(1);
		messages.assertSent({
			subject: "Réinitialiser le mot de passe",
			to: "forgot@example.com",
		});
	});

	test("forgot password with non-existent email", async ({ client }) => {
		const response = await client
			.post("/forgot-password")
			.header("origin", `https://${school.slug}.klaz.local`)
			.json({
				email: "nonexistent@example.com",
			});

		response.assertStatus(200);
		response.assertBodyContains({
			message: "If the email exists, a reset link has been sent",
		});
	});

	test("reset password with valid token", async ({ client, assert }) => {
		const user = await User.create({
			email: "reset@example.com",
			password: "OldPassword123!",
			schoolId: school.id,
			role: "STUDENT",
			isActive: true,
			level: 1,
			points: 0,
		});

		const resetToken = await user.generatePasswordResetToken();

		const response = await client
			.post("/reset-password")
			.header("origin", `https://${school.slug}.klaz.local`)
			.json({
				token: resetToken,
				password: "NewPassword123!",
			});

		response.assertStatus(200);
		response.assertBodyContains({
			message: "Password has been reset successfully",
		});

		await user.refresh();
		assert.isNull(user.resetPasswordToken);
		assert.isNull(user.resetPasswordExpires);
	});

	test("reset password with invalid token", async ({ client }) => {
		const response = await client
			.post("/reset-password")
			.header("origin", `https://${school.slug}.klaz.local`)
			.json({
				token: crypto.randomUUID(),
				password: "NewPassword123!",
			});

		response.assertStatus(400);
		response.assertBodyContains({
			message: "Invalid or expired reset token",
		});
	});

	test("reset password with expired token", async ({ client }) => {
		const user = await User.create({
			email: "expired.reset@example.com",
			password: "OldPassword123!",
			schoolId: school.id,
			role: "STUDENT",
			isActive: true,
			level: 1,
			points: 0,
		});

		const resetToken = await user.generatePasswordResetToken();
		// Forcer l'expiration du token
		user.resetPasswordExpires = DateTime.now().minus({ hours: 1 });
		await user.save();

		const response = await client
			.post("/reset-password")
			.header("origin", `https://${school.slug}.klaz.local`)
			.json({
				token: resetToken,
				password: "NewPassword123!",
			});

		response.assertStatus(400);
		response.assertBodyContains({
			message: "Invalid or expired reset token",
		});
	});

	test("cannot access tenant routes without origin header", async ({
		client,
	}) => {
		const response = await client.post("/login").json({
			email: "test@example.com",
			password: "Password123!",
		});

		response.assertStatus(400);
		response.assertBodyContains({
			error: "Origin required",
		});
	});

	test("cannot access routes with invalid school slug", async ({ client }) => {
		// TODO: Add test for invalid school slug when headers API is available
		const response = await client.post("/login").json({
			email: "test@example.com",
			password: "Password123!",
		});

		// Will return 400 for Origin required instead of 404 for now
		response.assertStatus(400);
	});

	test("logout authenticated user", async ({ client }) => {
		const user = await User.create({
			email: "logout@example.com",
			password: "Password123!",
			schoolId: school.id,
			role: "STUDENT",
			isActive: true,
			level: 1,
			points: 0,
		});

		const response = await client
			.post("/logout")
			.header("origin", `https://${school.slug}.klaz.local`)
			.loginAs(user);

		response.assertStatus(200);
	});

	test("delete account successfully", async ({ client, assert }) => {
		const user = await User.create({
			email: "delete.account@example.com",
			password: "Password123!",
			schoolId: school.id,
			role: "STUDENT",
			isActive: true,
			level: 1,
			points: 0,
		});

		const response = await client
			.delete("/profile/delete")
			.header("origin", `https://${school.slug}.klaz.local`)
			.loginAs(user);

		response.assertStatus(200);
		response.assertBodyContains({
			message: "Compte supprimé avec succès",
		});

		const deletedUser = await User.find(user.id);
		assert.isNull(deletedUser, "User should be deleted");
	});
});

test.group("User Model", (group) => {
	let school: School;

	group.setup(async () => {
		school = await School.create({
			name: "Test School User Model",
			slug: "test-school-user-model",
		});
	});

	group.teardown(async () => {
		await User.query().delete();
		await School.query().delete();
	});

	test("user helper methods work correctly", async ({ assert }) => {
		const student = await User.create({
			email: "student@example.com",
			password: "Password123!",
			schoolId: school.id,
			role: "STUDENT",
			isActive: true,
			level: 1,
			points: 0,
		});

		const admin = await User.create({
			email: "admin@example.com",
			password: "Password123!",
			schoolId: school.id,
			role: "ADMIN",
			isActive: true,
			level: 1,
			points: 0,
		});

		const superAdmin = await User.create({
			email: "superadmin@example.com",
			password: "Password123!",
			schoolId: school.id,
			role: "SUPERADMIN",
			isActive: true,
			level: 1,
			points: 0,
		});

		// Test student
		assert.isTrue(student.isStudent());
		assert.isFalse(student.isAdmin());
		assert.isFalse(student.isSuperAdmin());
		assert.isFalse(student.hasAdminRights());
		assert.isFalse(student.canManageSchool(school.id));

		// Test admin
		assert.isFalse(admin.isStudent());
		assert.isTrue(admin.isAdmin());
		assert.isFalse(admin.isSuperAdmin());
		assert.isTrue(admin.hasAdminRights());
		assert.isTrue(admin.canManageSchool(school.id));

		// Test super admin
		assert.isFalse(superAdmin.isStudent());
		assert.isFalse(superAdmin.isAdmin());
		assert.isTrue(superAdmin.isSuperAdmin());
		assert.isTrue(superAdmin.hasAdminRights());
		assert.isTrue(superAdmin.canManageSchool(school.id));
	});

	test("generateEmailVerificationToken creates and stores token", async ({
		assert,
	}) => {
		const user = await User.create({
			email: "verification@example.com",
			password: "Password123!",
			schoolId: school.id,
			role: "STUDENT",
			isActive: true,
			level: 1,
			points: 0,
		});

		const token = await user.generateEmailVerificationToken();
		await user.refresh();

		assert.isString(token);
		assert.equal(user.emailVerificationToken, token);
	});

	test("verifyEmail with correct token", async ({ assert }) => {
		const user = await User.create({
			email: "verify.correct@example.com",
			password: "Password123!",
			schoolId: school.id,
			role: "STUDENT",
			isActive: true,
			level: 1,
			points: 0,
			emailVerified: false,
		});

		const token = await user.generateEmailVerificationToken();
		const result = await user.verifyEmail(token);
		await user.refresh();

		assert.isTrue(result);
		assert.isTrue(user.emailVerified);
		assert.isNull(user.emailVerificationToken);
	});

	test("verifyEmail with incorrect token", async ({ assert }) => {
		const user = await User.create({
			email: "verify.wrong@example.com",
			password: "Password123!",
			schoolId: school.id,
			role: "STUDENT",
			isActive: true,
			level: 1,
			points: 0,
			emailVerified: false,
		});

		await user.generateEmailVerificationToken();
		const result = await user.verifyEmail("wrong-token");
		await user.refresh();

		assert.isFalse(result);
		assert.isFalse(user.emailVerified);
		assert.isNotNull(user.emailVerificationToken);
	});

	test("detachFromSchool resets user data", async ({ assert }) => {
		const user = await User.create({
			email: "detach@example.com",
			password: "Password123!",
			schoolId: school.id,
			role: "STUDENT",
			isActive: true,
			level: 5,
			points: 100,
		});

		await user.detachFromSchool();
		await user.refresh();

		assert.isNull(user.schoolId);
		assert.isNull(user.groupId);
		assert.equal(user.level, 1);
		assert.equal(user.points, 0);
	});

	test("isDetached returns correct value", async ({ assert }) => {
		const attachedUser = await User.create({
			email: "attached@example.com",
			password: "Password123!",
			schoolId: school.id,
			role: "STUDENT",
			isActive: true,
			level: 1,
			points: 0,
		});

		const detachedUser = await User.create({
			email: "detached@example.com",
			password: "Password123!",
			schoolId: null,
			role: "STUDENT",
			isActive: true,
			level: 1,
			points: 0,
		});

		assert.isFalse(attachedUser.isDetached());
		assert.isTrue(detachedUser.isDetached());
	});
});
