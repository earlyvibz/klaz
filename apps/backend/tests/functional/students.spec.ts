import { test } from "@japa/runner";
import School from "#models/school";
import User from "#models/user";

// Helper function to split fullName into firstName and lastName
function _splitName(fullName: string): {
	firstName: string;
	lastName: string | null;
} {
	const parts = fullName.trim().split(" ");
	const firstName = parts[0];
	const lastName = parts.length > 1 ? parts.slice(1).join(" ") : null;
	return { firstName, lastName };
}

test.group("Students", (group) => {
	let school1: School;
	let school2: School;
	let admin1: User;
	let _admin2: User;
	let student1: User;
	let _student2: User;
	let _student3: User;

	group.setup(async () => {
		// Créer deux écoles
		school1 = await School.create({
			name: "School 1",
			slug: "school-1",
		});

		school2 = await School.create({
			name: "School 2",
			slug: "school-2",
		});

		// Créer un admin pour chaque école
		admin1 = await User.create({
			email: "admin1@test.com",
			password: "Password123!",
			schoolId: school1.id,
			role: "ADMIN",
			isActive: true,
			level: 1,
			points: 0,
		});

		_admin2 = await User.create({
			email: "admin2@test.com",
			password: "Password123!",
			schoolId: school2.id,
			role: "ADMIN",
			isActive: true,
			level: 1,
			points: 0,
		});

		// Créer des étudiants pour chaque école
		const student1Name = _splitName("Student 1");
		student1 = await User.create({
			email: "student1@test.com",
			password: "Password123!",
			firstName: student1Name.firstName,
			lastName: student1Name.lastName,
			schoolId: school1.id,
			role: "STUDENT",
			isActive: true,
			level: 1,
			points: 100,
		});

		const student2Name = _splitName("Student 2");
		_student2 = await User.create({
			email: "student2@test.com",
			password: "Password123!",
			firstName: student2Name.firstName,
			lastName: student2Name.lastName,
			schoolId: school1.id,
			role: "STUDENT",
			isActive: true,
			level: 2,
			points: 200,
		});

		const student3Name = _splitName("Student 3");
		_student3 = await User.create({
			email: "student3@test.com",
			password: "Password123!",
			firstName: student3Name.firstName,
			lastName: student3Name.lastName,
			schoolId: school2.id,
			role: "STUDENT",
			isActive: true,
			level: 1,
			points: 50,
		});
	});

	group.teardown(async () => {
		await User.query().delete();
		await School.query().delete();
	});

	test("admin can get students from their own school", async ({
		client,
		assert,
	}) => {
		const adminToken = await User.accessTokens.create(admin1);

		const response = await client
			.get(`/schools/${school1.id}/students`)
			.bearerToken(adminToken.value?.release() || "");

		response.assertStatus(200);
		const body = response.body();

		assert.equal(body.meta.total, 2);
		assert.equal(body.data.length, 2);

		const studentEmails = body.data.map((s: any) => s.email);
		assert.include(studentEmails, "student1@test.com");
		assert.include(studentEmails, "student2@test.com");
		assert.notInclude(studentEmails, "student3@test.com");
	});

	test("pagination works correctly", async ({ client, assert }) => {
		const adminToken = await User.accessTokens.create(admin1);

		// Test avec limit=1 pour voir la pagination
		const response = await client
			.get(`/schools/${school1.id}/students?page=1&limit=1`)
			.bearerToken(adminToken.value?.release() || "");

		response.assertStatus(200);
		const body = response.body();

		assert.equal(body.meta.currentPage, 1);
		assert.equal(body.meta.perPage, 1);
		assert.equal(body.meta.total, 2);
		assert.equal(body.meta.lastPage, 2);
		assert.equal(body.data.length, 1);
	});

	test("admin cannot get students from another school", async ({ client }) => {
		const adminToken = await User.accessTokens.create(admin1);

		const response = await client
			.get(`/schools/${school2.id}/students`)
			.bearerToken(adminToken.value?.release() || "");

		response.assertStatus(403);
		response.assertBodyContains({
			message: "You can only access students from your own school",
		});
	});

	test("student cannot access students endpoint", async ({ client }) => {
		const studentToken = await User.accessTokens.create(student1);

		const response = await client
			.get(`/schools/${school1.id}/students`)
			.bearerToken(studentToken.value?.release() || "");

		response.assertStatus(403);
		response.assertBodyContains({
			message: "Admin rights required",
		});
	});

	test("unauthenticated user cannot access students endpoint", async ({
		client,
	}) => {
		const response = await client.get(`/schools/${school1.id}/students`);

		response.assertStatus(401);
	});
});
