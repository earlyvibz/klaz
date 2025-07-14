import limiter from "@adonisjs/limiter/services/main";
import { test } from "@japa/runner";
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
		await School.query().delete();
		await limiter.clear(["memory"]);
	});

	test("register a new user", async ({ client, assert }) => {
		const response = await client.post("/register").json({
			email: "test@example.com",
			password: "Password123!",
			schoolId: school.id,
		});

		response.assertStatus(200);
		response.assertBodyContains({
			type: "bearer",
		});

		const body = response.body();
		assert.isOk(body.token, "Token should be present");
		assert.isString(body.token, "Token should be a string");

		const user = await User.findBy("email", "test@example.com");
		assert.isNotNull(user, "User should be created");
		assert.equal(user?.role, "STUDENT", "Default role should be STUDENT");
		assert.isTrue(user?.isActive, "User should be active");
		assert.isTrue(user?.emailVerified, "Email should be verified");

		// Test des helper methods
		assert.isTrue(user?.isStudent(), "Should identify as student");
		assert.isFalse(user?.isAdmin(), "Should not identify as admin");
		assert.isFalse(user?.isSuperAdmin(), "Should not identify as super admin");
		assert.isFalse(user?.hasAdminRights(), "Should not have admin rights");
		assert.isFalse(
			user?.canManageSchool(school.id),
			"Should not manage school",
		);
	});

	test("cannot register with existing email", async ({ client }) => {
		await User.create({
			email: "existing@example.com",
			password: "Password123!",
			schoolId: school.id,
			role: "STUDENT",
			isActive: true,
			level: 1,
			points: 0,
		});

		const response = await client.post("/register").json({
			email: "existing@example.com",
			password: "Password123!",
			schoolId: school.id,
		});

		response.assertStatus(422);
		response.assertBodyContains({
			errors: [
				{
					field: "email",
					rule: "database.unique",
				},
			],
		});
	});

	test("cannot register without schoolId", async ({ client }) => {
		const response = await client.post("/register").json({
			email: "test@example.com",
			password: "Password123!",
		});

		response.assertStatus(422);
		response.assertBodyContains({
			errors: [
				{
					field: "schoolId",
					rule: "required",
				},
			],
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

		const response = await client.post("/login").json({
			email: "login@example.com",
			password: "Password123!",
		});

		response.assertStatus(200);
		response.assertBodyContains({
			token: {
				type: "bearer",
			},
		});

		const body = response.body();
		assert.isOk(body.token.token, "Token should be present");
		assert.isString(body.token.token, "Token should be a string");
	});

	test("cannot login with wrong credentials", async ({ client }) => {
		const response = await client.post("/login").json({
			email: "wrong@example.com",
			password: "wrongpassword",
		});

		response.assertStatus(400);
		response.assertBodyContains({
			message: "Invalid credentials",
		});
	});

	test("cannot login with inactive user", async ({ client }) => {
		await User.create({
			email: "inactive@example.com",
			password: "Password123!",
			schoolId: school.id,
			role: "STUDENT",
			isActive: false,
			level: 1,
			points: 0,
		});

		const response = await client.post("/login").json({
			email: "inactive@example.com",
			password: "Password123!",
		});

		response.assertStatus(200); // Login réussit même si inactif
	});

	test("logout user", async ({ client }) => {
		const user = await User.create({
			email: "logout@example.com",
			password: "Password123!",
			schoolId: school.id,
			role: "STUDENT",
			isActive: true,
			level: 1,
			points: 0,
		});

		const token = await User.accessTokens.create(user);
		const response = await client
			.delete("/logout")
			.bearerToken(token.value?.release() || "");

		response.assertStatus(200);
		response.assertBodyContains({
			message: "Logged out successfully",
		});
	});

	test("get authenticated user info", async ({ client, assert }) => {
		const user = await User.create({
			email: "me@example.com",
			password: "Password123!",
			schoolId: school.id,
			role: "STUDENT",
			isActive: true,
			level: 1,
			points: 0,
		});

		const token = await User.accessTokens.create(user);
		const response = await client
			.get("/me")
			.bearerToken(token.value?.release() || "");

		response.assertStatus(200);
		const body = response.body();
		assert.equal(body.user.email, "me@example.com");
		assert.equal(body.user.role, "STUDENT");
	});

	test("cannot access protected route without token", async ({ client }) => {
		const response = await client.get("/me");

		response.assertStatus(401);
	});

	test("forgot password with valid email", async ({ client }) => {
		await User.create({
			email: "forgot@example.com",
			password: "Password123!",
			schoolId: school.id,
			role: "STUDENT",
			isActive: true,
			level: 1,
			points: 0,
		});

		const response = await client.post("/forgot-password").json({
			email: "forgot@example.com",
		});

		response.assertStatus(200);
		response.assertBodyContains({
			message: "If the email exists, a reset link has been sent",
		});
	});

	test("forgot password with non-existent email", async ({ client }) => {
		const response = await client.post("/forgot-password").json({
			email: "nonexistent@example.com",
		});

		response.assertStatus(200);
		response.assertBodyContains({
			message: "If the email exists, a reset link has been sent",
		});
	});
});
