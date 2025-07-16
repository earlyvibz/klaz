import { join } from "node:path";
import app from "@adonisjs/core/services/app";
import limiter from "@adonisjs/limiter/services/main";
import mail from "@adonisjs/mail/services/main";
import { test } from "@japa/runner";
import { DateTime } from "luxon";
import Invitation from "#models/invitation";
import School from "#models/school";
import User from "#models/user";

// Helper function to split fullName into firstName and lastName
function splitName(fullName: string): {
	firstName: string;
	lastName: string | null;
} {
	const parts = fullName.trim().split(" ");
	const firstName = parts[0];
	const lastName = parts.length > 1 ? parts.slice(1).join(" ") : null;
	return { firstName, lastName };
}

test.group("Invitations", (group) => {
	let school: School;
	let admin: User;

	group.setup(async () => {
		const fs = await import("node:fs/promises");
		const tmpDir = app.makePath("tmp");
		try {
			await fs.mkdir(tmpDir, { recursive: true });
		} catch {}

		school = await School.create({
			name: "Test School Invitations",
			slug: "test-school-invitations",
		});

		admin = await User.create({
			email: "admin@test.com",
			password: "Password123!",
			schoolId: school.id,
			role: "ADMIN",
			isActive: true,
			level: 1,
			points: 0,
		});
	});

	group.teardown(async () => {
		await Invitation.query().delete();
		await User.query().delete();
		await School.query().delete();
		await limiter.clear(["memory"]);

		const fs = await import("node:fs/promises");
		const tmpDir = app.makePath("tmp");
		try {
			const files = await fs.readdir(tmpDir);
			for (const file of files) {
				if (file.endsWith(".csv")) {
					await fs.unlink(join(tmpDir, file));
				}
			}
		} catch {}
	});

	test("list invitations for admin", async ({ client, assert }) => {
		// Créer des invitations
		const student1Name = splitName("Student 1");
		const student2Name = splitName("Student 2");
		await Invitation.createMany([
			{
				schoolEmail: "student1@school.com",
				firstName: student1Name.firstName,
				lastName: student1Name.lastName,
				invitationCode: crypto.randomUUID(),
				schoolId: school.id,
				isUsed: false,
				expiresAt: DateTime.now().plus({ days: 30 }),
			},
			{
				schoolEmail: "student2@school.com",
				firstName: student2Name.firstName,
				lastName: student2Name.lastName,
				invitationCode: crypto.randomUUID(),
				schoolId: school.id,
				isUsed: false,
				expiresAt: DateTime.now().plus({ days: 30 }),
			},
		]);

		const token = await User.accessTokens.create(admin);
		const response = await client
			.get("/invitations")
			.bearerToken(token.value?.release() || "");

		response.assertStatus(200);
		const body = response.body();
		assert.equal(body.invitations.length, 2);
		assert.equal(body.invitations[0].schoolEmail, "student2@school.com");
		assert.equal(body.invitations[1].schoolEmail, "student1@school.com");
	});

	test("list invitations with user enrichment", async ({ client, assert }) => {
		// Nettoyer les invitations existantes
		await Invitation.query().delete();

		// Créer une invitation utilisée avec un utilisateur lié
		const studentName = splitName("Enriched Student");
		const invitation = await Invitation.create({
			schoolEmail: "enriched@school.com",
			firstName: studentName.firstName,
			lastName: studentName.lastName,
			invitationCode: crypto.randomUUID(),
			schoolId: school.id,
			isUsed: true,
			expiresAt: DateTime.now().plus({ days: 30 }),
		});

		// Créer un utilisateur pour cette invitation
		const user = await User.create({
			email: "enriched@personal.com",
			password: "Password123!",
			firstName: invitation.firstName,
			lastName: invitation.lastName,
			schoolId: school.id,
			role: "STUDENT",
			isActive: true,
			level: 3,
			points: 500,
		});

		invitation.userId = user.id;
		await invitation.save();

		const token = await User.accessTokens.create(admin);
		const response = await client
			.get("/invitations")
			.bearerToken(token.value?.release() || "");

		response.assertStatus(200);
		const body = response.body();
		assert.equal(body.invitations.length, 1);

		const invitationData = body.invitations[0];
		assert.equal(invitationData.schoolEmail, "enriched@school.com");
		assert.equal(invitationData.status, "ACTIVE");
		assert.isTrue(invitationData.user.exists);
		assert.isTrue(invitationData.user.isActive);
		assert.equal(invitationData.user.email, "enriched@personal.com");
		assert.equal(invitationData.user.level, 3);
		assert.equal(invitationData.user.points, 500);
	});

	test("delete unused invitation", async ({ client, assert }) => {
		const toDeleteName = splitName("To Delete");
		const invitation = await Invitation.create({
			schoolEmail: "todelete@school.com",
			firstName: toDeleteName.firstName,
			lastName: toDeleteName.lastName,
			invitationCode: crypto.randomUUID(),
			schoolId: school.id,
			isUsed: false,
			expiresAt: DateTime.now().plus({ days: 30 }),
		});

		const token = await User.accessTokens.create(admin);
		const response = await client
			.delete(`/invitations/${invitation.id}`)
			.bearerToken(token.value?.release() || "");

		response.assertStatus(200);
		response.assertBodyContains({
			message: "Invitation deleted successfully",
		});

		const deletedInvitation = await Invitation.find(invitation.id);
		assert.isNull(deletedInvitation);
	});

	test("cannot delete used invitation", async ({ client }) => {
		const usedName = splitName("Used");
		const invitation = await Invitation.create({
			schoolEmail: "used@school.com",
			firstName: usedName.firstName,
			lastName: usedName.lastName,
			invitationCode: crypto.randomUUID(),
			schoolId: school.id,
			isUsed: true,
			expiresAt: DateTime.now().plus({ days: 30 }),
		});

		const token = await User.accessTokens.create(admin);
		const response = await client
			.delete(`/invitations/${invitation.id}`)
			.bearerToken(token.value?.release() || "");

		response.assertStatus(400);
		response.assertBodyContains({
			message: "Cannot delete used invitation",
		});
	});

	test("cannot access invitations without admin rights", async ({ client }) => {
		const student = await User.create({
			email: "student@test.com",
			password: "Password123!",
			schoolId: school.id,
			role: "STUDENT",
			isActive: true,
			level: 1,
			points: 0,
		});

		const token = await User.accessTokens.create(student);
		const response = await client
			.get("/invitations")
			.bearerToken(token.value?.release() || "");

		response.assertStatus(403);
		response.assertBodyContains({
			message: "Admin rights required",
		});
	});

	test("signup with valid invitation code", async ({ client, assert }) => {
		const newStudentName = splitName("New Student");
		const invitation = await Invitation.create({
			schoolEmail: "signup@school.com",
			firstName: newStudentName.firstName,
			lastName: newStudentName.lastName,
			invitationCode: crypto.randomUUID(),
			schoolId: school.id,
			isUsed: false,
			expiresAt: DateTime.now().plus({ days: 30 }),
		});

		const response = await client.post("/signup").json({
			invitationCode: invitation.invitationCode,
			email: "mystudent@personal.com",
			password: "NewPassword123!",
		});

		response.assertStatus(200);
		response.assertBodyContains({
			type: "bearer",
		});

		// Vérifier que l'utilisateur a été créé
		const user = await User.findBy("email", "mystudent@personal.com");
		assert.isNotNull(user);
		assert.equal(user?.firstName, "New");
		assert.equal(user?.lastName, "Student");
		assert.equal(user?.schoolId, school.id);
		assert.isTrue(user?.isActive);

		// Vérifier que l'invitation est marquée comme utilisée
		await invitation.refresh();
		assert.isTrue(invitation.isUsed);
	});

	test("cannot signup with expired invitation", async ({ client }) => {
		const expiredName = splitName("Expired");
		const invitation = await Invitation.create({
			schoolEmail: "expired@school.com",
			firstName: expiredName.firstName,
			lastName: expiredName.lastName,
			invitationCode: crypto.randomUUID(),
			schoolId: school.id,
			isUsed: false,
			expiresAt: DateTime.now().minus({ days: 1 }),
		});

		const response = await client.post("/signup").json({
			invitationCode: invitation.invitationCode,
			email: "test@personal.com",
			password: "NewPassword123!",
		});

		response.assertStatus(400);
		response.assertBodyContains({
			message: "This invitation code has expired",
		});
	});

	test("cannot signup with already used invitation", async ({ client }) => {
		const usedName2 = splitName("Used");
		const invitation = await Invitation.create({
			schoolEmail: "used@school.com",
			firstName: usedName2.firstName,
			lastName: usedName2.lastName,
			invitationCode: crypto.randomUUID(),
			schoolId: school.id,
			isUsed: true,
			expiresAt: DateTime.now().plus({ days: 30 }),
		});

		const response = await client.post("/signup").json({
			invitationCode: invitation.invitationCode,
			email: "test@personal.com",
			password: "NewPassword123!",
		});

		response.assertStatus(400);
		response.assertBodyContains({
			message: "This invitation code has already been used",
		});
	});

	test("get invitation stats", async ({ client, assert }) => {
		// Nettoyer les invitations existantes
		await Invitation.query().delete();

		// Créer différents types d'invitations pour tester les stats
		const student1Name = splitName("Active Student");
		const student2Name = splitName("Pending Student");
		const student3Name = splitName("Expired Student");
		const student4Name = splitName("Inactive Student");

		const activeInvitation = await Invitation.create({
			schoolEmail: "active@school.com",
			firstName: student1Name.firstName,
			lastName: student1Name.lastName,
			invitationCode: crypto.randomUUID(),
			schoolId: school.id,
			isUsed: true,
			expiresAt: DateTime.now().plus({ days: 30 }),
		});

		const inactiveInvitation = await Invitation.create({
			schoolEmail: "inactive@school.com",
			firstName: student4Name.firstName,
			lastName: student4Name.lastName,
			invitationCode: crypto.randomUUID(),
			schoolId: school.id,
			isUsed: true,
			expiresAt: DateTime.now().plus({ days: 30 }),
		});

		await Invitation.create({
			schoolEmail: "pending@school.com",
			firstName: student2Name.firstName,
			lastName: student2Name.lastName,
			invitationCode: crypto.randomUUID(),
			schoolId: school.id,
			isUsed: false,
			expiresAt: DateTime.now().plus({ days: 30 }),
		});

		await Invitation.create({
			schoolEmail: "expired@school.com",
			firstName: student3Name.firstName,
			lastName: student3Name.lastName,
			invitationCode: crypto.randomUUID(),
			schoolId: school.id,
			isUsed: false,
			expiresAt: DateTime.now().minus({ days: 1 }),
		});

		// Créer un utilisateur actif pour l'invitation active
		const activeUser = await User.create({
			email: "active@personal.com",
			password: "Password123!",
			firstName: activeInvitation.firstName,
			lastName: activeInvitation.lastName,
			schoolId: school.id,
			role: "STUDENT",
			isActive: true,
			level: 1,
			points: 0,
		});

		// Créer un utilisateur inactif pour l'invitation inactive
		const inactiveUser = await User.create({
			email: "inactive@personal.com",
			password: "Password123!",
			firstName: inactiveInvitation.firstName,
			lastName: inactiveInvitation.lastName,
			schoolId: school.id,
			role: "STUDENT",
			isActive: false,
			level: 1,
			points: 0,
		});

		activeInvitation.userId = activeUser.id;
		await activeInvitation.save();

		inactiveInvitation.userId = inactiveUser.id;
		await inactiveInvitation.save();

		const token = await User.accessTokens.create(admin);
		const response = await client
			.get("/invitations/stats")
			.bearerToken(token.value?.release() || "");

		response.assertStatus(200);
		const body = response.body();
		assert.equal(body.stats.total, 4);
		assert.equal(body.stats.pending, 1);
		assert.equal(body.stats.used, 2);
		assert.equal(body.stats.expired, 1);
		assert.equal(body.stats.activeUsers, 1);
		assert.equal(body.stats.inactiveUsers, 1);
		assert.equal(body.stats.conversionRate, 50);
	});

	test("show specific invitation", async ({ client, assert }) => {
		const studentName = splitName("Show Student");
		const invitation = await Invitation.create({
			schoolEmail: "show@school.com",
			firstName: studentName.firstName,
			lastName: studentName.lastName,
			invitationCode: crypto.randomUUID(),
			schoolId: school.id,
			isUsed: false,
			expiresAt: DateTime.now().plus({ days: 30 }),
		});

		const token = await User.accessTokens.create(admin);
		const response = await client
			.get(`/invitations/${invitation.id}`)
			.bearerToken(token.value?.release() || "");

		response.assertStatus(200);
		const body = response.body();
		assert.equal(body.invitation.id, invitation.id);
		assert.equal(body.invitation.schoolEmail, "show@school.com");
	});

	test("resend invitation email", async ({ client }) => {
		const { messages } = mail.fake();
		const studentName = splitName("Resend Student");
		const invitation = await Invitation.create({
			schoolEmail: "resend@school.com",
			firstName: studentName.firstName,
			lastName: studentName.lastName,
			invitationCode: crypto.randomUUID(),
			schoolId: school.id,
			isUsed: false,
			expiresAt: DateTime.now().plus({ days: 30 }),
		});

		const token = await User.accessTokens.create(admin);
		await client
			.post(`/invitations/${invitation.id}/resend`)
			.bearerToken(token.value?.release() || "");

		messages.assertSentCount(1);
		messages.assertSent({
			subject: "Invitation à rejoindre la plateforme Klaz",
			to: invitation.schoolEmail,
		});
	});

	test("cannot resend used invitation", async ({ client }) => {
		const studentName = splitName("Used Resend");
		const invitation = await Invitation.create({
			schoolEmail: "usedresend@school.com",
			firstName: studentName.firstName,
			lastName: studentName.lastName,
			invitationCode: crypto.randomUUID(),
			schoolId: school.id,
			isUsed: true,
			expiresAt: DateTime.now().plus({ days: 30 }),
		});

		const token = await User.accessTokens.create(admin);
		const response = await client
			.post(`/invitations/${invitation.id}/resend`)
			.bearerToken(token.value?.release() || "");

		response.assertStatus(400);
		response.assertBodyContains({
			message: "Cannot resend used invitation",
		});
	});

	test("cannot access invitation from another school", async ({ client }) => {
		const otherSchool = await School.create({
			name: "Other School",
			slug: "other-school",
		});

		const studentName = splitName("Other Student");
		const invitation = await Invitation.create({
			schoolEmail: "other@school.com",
			firstName: studentName.firstName,
			lastName: studentName.lastName,
			invitationCode: crypto.randomUUID(),
			schoolId: otherSchool.id,
			isUsed: false,
			expiresAt: DateTime.now().plus({ days: 30 }),
		});

		const token = await User.accessTokens.create(admin);
		const response = await client
			.get(`/invitations/${invitation.id}`)
			.bearerToken(token.value?.release() || "");

		response.assertStatus(404);
		response.assertBodyContains({
			message: "Invitation not found",
		});
	});

	test("admin without school cannot access invitations", async ({ client }) => {
		const adminNoSchool = await User.create({
			email: "admin.noschool@test.com",
			password: "Password123!",
			schoolId: null,
			role: "ADMIN",
			isActive: true,
			level: 1,
			points: 0,
		});

		const token = await User.accessTokens.create(adminNoSchool);
		const response = await client
			.get("/invitations")
			.bearerToken(token.value?.release() || "");

		response.assertStatus(403);
		response.assertBodyContains({
			message: "User is not associated with a school",
		});
	});

	test("unauthenticated user cannot access invitations", async ({ client }) => {
		const response = await client.get("/invitations");

		response.assertStatus(401);
	});

	test("invalid token cannot access invitations", async ({ client }) => {
		const response = await client
			.get("/invitations")
			.bearerToken("invalid-token");

		response.assertStatus(401);
	});

	test("unauthenticated user cannot access stats", async ({ client }) => {
		const response = await client.get("/invitations/stats");

		response.assertStatus(401);
	});

	test("admin without school cannot access stats", async ({ client }) => {
		const adminNoSchool = await User.create({
			email: "admin.nostats@test.com",
			password: "Password123!",
			schoolId: null,
			role: "ADMIN",
			isActive: true,
			level: 1,
			points: 0,
		});

		const token = await User.accessTokens.create(adminNoSchool);
		const response = await client
			.get("/invitations/stats")
			.bearerToken(token.value?.release() || "");

		response.assertStatus(403);
		response.assertBodyContains({
			message: "User is not associated with a school",
		});
	});

	test("should resend invitation email", async ({ client, cleanup }) => {
		const { messages } = mail.fake();
		const token = await User.accessTokens.create(admin);
		const invitation = await Invitation.create({
			schoolEmail: "test@example.com",
			invitationCode: "RESEND123",
			schoolId: admin.schoolId || "",
			isUsed: false,
		});
		cleanup(() => mail.restore());

		await client
			.post(`/invitations/${invitation.id}/resend`)
			.bearerToken(token.value?.release() || "");

		messages.assertSentCount(1);
		messages.assertSent({
			subject: "Invitation à rejoindre la plateforme Klaz",
			to: invitation.schoolEmail,
		});
	});

	test("should return 401 when resending without authentication", async ({
		client,
	}) => {
		const invitation = await Invitation.create({
			schoolEmail: "test@example.com",
			invitationCode: "UNAUTH123",
			schoolId: school.id,
			isUsed: false,
		});

		const response = await client.post(`/invitations/${invitation.id}/resend`);

		response.assertStatus(401);
	});

	test("should return 403 when user has no school for resend", async ({
		client,
	}) => {
		const detachedUser = await User.create({
			email: "detached@example.com",
			password: "password123",
			role: "ADMIN",
			schoolId: null,
			level: 1,
			points: 0,
			isActive: true,
		});

		const token = await User.accessTokens.create(detachedUser);
		const invitation = await Invitation.create({
			schoolEmail: "test@example.com",
			invitationCode: "NOSCHOOL123",
			schoolId: school.id,
			isUsed: false,
		});

		const response = await client
			.post(`/invitations/${invitation.id}/resend`)
			.bearerToken(token.value?.release() || "");

		response.assertStatus(403);
	});

	test("should return 404 when invitation not found for resend", async ({
		client,
	}) => {
		const token = await User.accessTokens.create(admin);

		const response = await client
			.post("/invitations/non-existent-id/resend")
			.bearerToken(token.value?.release() || "");

		response.assertStatus(404);
	});

	test("should return 400 when trying to resend used invitation", async ({
		client,
	}) => {
		const token = await User.accessTokens.create(admin);
		const invitation = await Invitation.create({
			schoolEmail: "used@example.com",
			invitationCode: "USED123",
			schoolId: admin.schoolId || "",
			isUsed: true,
		});

		const response = await client
			.post(`/invitations/${invitation.id}/resend`)
			.bearerToken(token.value?.release() || "");

		response.assertStatus(400);
	});

	test("invitation displayName should work with firstName and lastName", async ({
		assert,
	}) => {
		const invitation = new Invitation();
		invitation.firstName = "John";
		invitation.lastName = "Doe";
		invitation.schoolEmail = "john.doe@school.com";

		assert.equal(invitation.displayName, "John Doe");
	});

	test("invitation displayName should work with firstName only", async ({
		assert,
	}) => {
		const invitation = new Invitation();
		invitation.firstName = "John";
		invitation.lastName = null;
		invitation.schoolEmail = "john@school.com";

		assert.equal(invitation.displayName, "John");
	});

	test("invitation displayName should work with lastName only", async ({
		assert,
	}) => {
		const invitation = new Invitation();
		invitation.firstName = null;
		invitation.lastName = "Doe";
		invitation.schoolEmail = "doe@school.com";

		assert.equal(invitation.displayName, "Doe");
	});

	test("invitation displayName should fallback to email", async ({
		assert,
	}) => {
		const invitation = new Invitation();
		invitation.firstName = null;
		invitation.lastName = null;
		invitation.schoolEmail = "test@school.com";

		assert.equal(invitation.displayName, "test@school.com");
	});

	test("invitation isExpired should return false when no expiration", async ({
		assert,
	}) => {
		const invitation = new Invitation();
		invitation.expiresAt = null;

		assert.isFalse(invitation.isExpired());
	});

	test("invitation isExpired should return true when expired", async ({
		assert,
	}) => {
		const invitation = new Invitation();
		invitation.expiresAt = DateTime.now().minus({ days: 1 });

		assert.isTrue(invitation.isExpired());
	});

	test("invitation isExpired should return false when not expired", async ({
		assert,
	}) => {
		const invitation = new Invitation();
		invitation.expiresAt = DateTime.now().plus({ days: 1 });

		assert.isFalse(invitation.isExpired());
	});

	// CSV Import Tests
	test("import CSV with valid students creates invitations", async ({
		client,
		assert,
	}) => {
		const { messages } = mail.fake();
		const csvContent = `email,name
john.doe@example.com,John Doe
jane.smith@example.com,Jane Smith
bob.wilson@example.com,Bob Wilson`;

		const csvPath = join(app.makePath("tmp"), "test_students.csv");

		const fs = await import("node:fs/promises");
		await fs.writeFile(csvPath, csvContent);

		const token = await User.accessTokens.create(admin);

		const response = await client
			.post("/students/import")
			.bearerToken(token.value?.release() || "")
			.file("csv_file", csvPath);

		messages.assertSentCount(3);
		messages.assertSent({
			subject: "Invitation à rejoindre la plateforme Klaz",
			to: "john.doe@example.com",
		});

		response.assertStatus(200);
		response.assertBodyContains({
			created: 3,
			message: "Successfully created 3 invitations",
		});

		const body = response.body();
		assert.equal(body.invitations.length, 3);
		assert.isOk(body.invitations[0].invitationCode);

		// Vérifier en base que les invitations ont été créées
		const invitations = await Invitation.query().whereIn("schoolEmail", [
			"john.doe@example.com",
			"jane.smith@example.com",
			"bob.wilson@example.com",
		]);

		assert.equal(invitations.length, 3);
		for (const invitation of invitations) {
			assert.equal(invitation.schoolId, school.id);
			assert.isFalse(invitation.isUsed);
			assert.isOk(invitation.invitationCode);
			assert.isNotNull(invitation.expiresAt);
		}
	});

	test("cannot import CSV without admin rights", async ({ client }) => {
		const student = await User.create({
			email: "student-import@test.com",
			password: "Password123!",
			schoolId: school.id,
			role: "STUDENT",
			isActive: true,
			level: 1,
			points: 0,
		});

		const csvContent = "email,name\ntest@example.com,Test User";
		const csvPath = join(app.makePath("tmp"), "test_students2.csv");

		const fs = await import("node:fs/promises");
		await fs.writeFile(csvPath, csvContent);

		const token = await User.accessTokens.create(student);

		const response = await client
			.post("/students/import")
			.bearerToken(token.value?.release() || "")
			.file("csv_file", csvPath);

		response.assertStatus(403);
		response.assertBodyContains({
			message: "Admin rights required",
		});
	});

	test("reject CSV without email column", async ({ client }) => {
		const csvContent = "name,groupe\nJohn Doe,L3 INFO";
		const csvPath = join(app.makePath("tmp"), "test_no_email.csv");

		const fs = await import("node:fs/promises");
		await fs.writeFile(csvPath, csvContent);

		const token = await User.accessTokens.create(admin);

		const response = await client
			.post("/students/import")
			.bearerToken(token.value?.release() || "")
			.file("csv_file", csvPath);

		response.assertStatus(400);
		response.assertBodyContains({
			message: "CSV must contain an email column",
		});
	});

	test("skip duplicate emails in CSV", async ({ client, assert }) => {
		// Créer une invitation existante
		const existingUserName = splitName("Existing User");
		await Invitation.create({
			schoolEmail: "existing@example.com",
			firstName: existingUserName.firstName,
			lastName: existingUserName.lastName,
			invitationCode: crypto.randomUUID(),
			schoolId: school.id,
			isUsed: false,
		});

		const csvContent = `email,name
existing@example.com,Existing User
new@example.com,New User`;

		const csvPath = join(app.makePath("tmp"), "test_duplicates.csv");

		const fs = await import("node:fs/promises");
		await fs.writeFile(csvPath, csvContent);

		const token = await User.accessTokens.create(admin);

		const response = await client
			.post("/students/import")
			.bearerToken(token.value?.release() || "")
			.file("csv_file", csvPath);

		response.assertStatus(200);

		const body = response.body();
		assert.equal(body.created, 1); // Seulement le nouveau
		assert.equal(body.errors.length, 1); // Une erreur pour le doublon
		assert.include(body.errors[0], "already exists");
	});

	test("reject request without CSV file", async ({ client }) => {
		const token = await User.accessTokens.create(admin);

		const response = await client
			.post("/students/import")
			.bearerToken(token.value?.release() || "");

		response.assertStatus(422);
		response.assertBodyContains({
			errors: [
				{
					field: "csv_file",
					message: "The csv_file field must be defined",
					rule: "required",
				},
			],
		});
	});

	test("reject empty CSV file", async ({ client }) => {
		const csvContent = "";
		const csvPath = join(app.makePath("tmp"), "empty.csv");

		const fs = await import("node:fs/promises");
		await fs.writeFile(csvPath, csvContent);

		const token = await User.accessTokens.create(admin);

		const response = await client
			.post("/students/import")
			.bearerToken(token.value?.release() || "")
			.file("csv_file", csvPath);

		response.assertStatus(422);
	});

	test("reject CSV with header only", async ({ client }) => {
		const csvContent = "email,name";
		const csvPath = join(app.makePath("tmp"), "header_only.csv");

		const fs = await import("node:fs/promises");
		await fs.writeFile(csvPath, csvContent);

		const token = await User.accessTokens.create(admin);

		const response = await client
			.post("/students/import")
			.bearerToken(token.value?.release() || "")
			.file("csv_file", csvPath);

		response.assertStatus(400);
		response.assertBodyContains({
			message: "CSV must contain at least a header and one student",
		});
	});

	test("reject invalid file type", async ({ client }) => {
		const txtContent = "This is not a CSV file";
		const txtPath = join(app.makePath("tmp"), "invalid.txt");

		const fs = await import("node:fs/promises");
		await fs.writeFile(txtPath, txtContent);

		const token = await User.accessTokens.create(admin);

		const response = await client
			.post("/students/import")
			.bearerToken(token.value?.release() || "")
			.file("csv_file", txtPath);

		response.assertStatus(422);
	});

	test("reject CSV with invalid emails", async ({ client, assert }) => {
		const csvContent = `email,name
invalid-email,John Doe
not-an-email,Jane Smith`;

		const csvPath = join(app.makePath("tmp"), "invalid_emails.csv");

		const fs = await import("node:fs/promises");
		await fs.writeFile(csvPath, csvContent);

		const token = await User.accessTokens.create(admin);

		const response = await client
			.post("/students/import")
			.bearerToken(token.value?.release() || "")
			.file("csv_file", csvPath);

		response.assertStatus(400);
		response.assertBodyContains({
			message: "No valid invitations to create",
		});

		const body = response.body();
		assert.equal(body.errors.length, 2);
		assert.include(body.errors[0], "Invalid email");
		assert.include(body.errors[1], "Invalid email");
	});

	test("handle CSV with incomplete lines", async ({ client, assert }) => {
		const csvContent = `email,name,extra
john@example.com,John Doe,Group1
incomplete@example.com`;

		const csvPath = join(app.makePath("tmp"), "incomplete_lines.csv");

		const fs = await import("node:fs/promises");
		await fs.writeFile(csvPath, csvContent);

		const token = await User.accessTokens.create(admin);

		const response = await client
			.post("/students/import")
			.bearerToken(token.value?.release() || "")
			.file("csv_file", csvPath);

		response.assertStatus(200);

		const body = response.body();
		// Seule la première ligne complète devrait être importée
		assert.equal(body.created, 1);
		assert.equal(body.invitations[0].schoolEmail, "john@example.com");
	});
});
