import { join } from "node:path";
import app from "@adonisjs/core/services/app";
import limiter from "@adonisjs/limiter/services/main";
import { test } from "@japa/runner";
import { DateTime } from "luxon";
import Invitation from "#models/invitation";
import School from "#models/school";
import User from "#models/user";

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
		await Invitation.createMany([
			{
				schoolEmail: "student1@school.com",
				fullName: "Student 1",
				invitationCode: crypto.randomUUID(),
				schoolId: school.id,
				isUsed: false,
				expiresAt: DateTime.now().plus({ days: 30 }),
			},
			{
				schoolEmail: "student2@school.com",
				fullName: "Student 2",
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

	test("delete unused invitation", async ({ client, assert }) => {
		const invitation = await Invitation.create({
			schoolEmail: "todelete@school.com",
			fullName: "To Delete",
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
		const invitation = await Invitation.create({
			schoolEmail: "used@school.com",
			fullName: "Used",
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
		const invitation = await Invitation.create({
			schoolEmail: "signup@school.com",
			fullName: "New Student",
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
		assert.equal(user?.fullName, "New Student");
		assert.equal(user?.schoolId, school.id);
		assert.isTrue(user?.isActive);

		// Vérifier que l'invitation est marquée comme utilisée
		await invitation.refresh();
		assert.isTrue(invitation.isUsed);
		assert.equal(invitation.userId, user?.id);
	});

	test("cannot signup with expired invitation", async ({ client }) => {
		const invitation = await Invitation.create({
			schoolEmail: "expired@school.com",
			fullName: "Expired",
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
		const invitation = await Invitation.create({
			schoolEmail: "used@school.com",
			fullName: "Used",
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

	test("cannot signup with existing email", async ({ client }) => {
		const invitation = await Invitation.create({
			schoolEmail: "new@school.com",
			fullName: "New",
			invitationCode: crypto.randomUUID(),
			schoolId: school.id,
			isUsed: false,
			expiresAt: DateTime.now().plus({ days: 30 }),
		});

		const response = await client.post("/signup").json({
			invitationCode: invitation.invitationCode,
			email: "admin@test.com", // Email déjà utilisé
			password: "NewPassword123!",
		});

		response.assertStatus(422);
		response.assertBodyContains({
			errors: [
				{
					field: "email",
					message: "The email has already been taken",
					rule: "database.unique",
				},
			],
		});
	});
});
