// import type { HttpContext } from "@adonisjs/core/http";
// import { test } from "@japa/runner";
// import School from "#models/school";
// import User from "#models/user";

// // Helper function to split fullName into firstName and lastName
// function _splitName(fullName: string): {
// 	firstName: string;
// 	lastName: string | null;
// } {
// 	const parts = fullName.trim().split(" ");
// 	const firstName = parts[0];
// 	const lastName = parts.length > 1 ? parts.slice(1).join(" ") : null;
// 	return { firstName, lastName };
// }

// // Note: Tests use HTTP API which handles tenant context via middleware
// // No need for manual context setup

// test.group("Students", (group) => {
// 	let school1: School;
// 	let school2: School;
// 	let admin1: User;
// 	let student1: User;

// 	group.setup(async () => {
// 		// Créer deux écoles
// 		school1 = await School.create({
// 			name: "School 1",
// 			slug: "school-1",
// 		});

// 		school2 = await School.create({
// 			name: "School 2",
// 			slug: "school-2",
// 		});

// 		// Créer un admin pour chaque école
// 		admin1 = await User.create({
// 			email: "admin1@test.com",
// 			password: "Password123!",
// 			schoolId: school1.id,
// 			role: "ADMIN",
// 			isActive: true,
// 			level: 1,
// 			points: 0,
// 		});

// 		// Créer des étudiants pour chaque école
// 		const student1Name = _splitName("Student 1");
// 		student1 = await User.create({
// 			email: "student1@test.com",
// 			password: "Password123!",
// 			firstName: student1Name.firstName,
// 			lastName: student1Name.lastName,
// 			schoolId: school1.id,
// 			role: "STUDENT",
// 			isActive: true,
// 			level: 1,
// 			points: 100,
// 		});
// 	});

// 	group.teardown(async () => {
// 		await User.query().delete();
// 		await School.query().delete();
// 	});

// 	test("admin can get students from their own school", async ({
// 		client,
// 		assert,
// 	}) => {
// 		const response = await client.get("/students");

// 		response.assertStatus(200);
// 		const body = response.body();

// 		assert.equal(body.meta.total, 1);
// 		assert.equal(body.data.length, 1);

// 		const studentEmails = body.data.map((s: { email: string }) => s.email);
// 		assert.include(studentEmails, "student1@test.com");
// 	});

// 	test("pagination works correctly", async ({ client, assert }) => {
// 		// Test avec limit=1 pour voir la pagination
// 		const response = await client.get("/students?page=1&limit=1");

// 		response.assertStatus(200);
// 		const body = response.body();

// 		assert.equal(body.meta.currentPage, 1);
// 		assert.equal(body.meta.perPage, 1);
// 		assert.equal(body.meta.total, 1);
// 		assert.equal(body.data.length, 1);
// 	});

// 	test("admin can only get students from their own school", async ({
// 		client,
// 		assert,
// 	}) => {
// 		const response = await client.get("/students");

// 		response.assertStatus(200);
// 		const body = response.body();

// 		// Devrait retourner 1 étudiant car admin1 voit les étudiants de school1
// 		assert.equal(body.meta.total, 1);
// 		assert.equal(body.data.length, 1);
// 		assert.equal(body.data[0].email, "student1@test.com");
// 	});

// 	test("student cannot access students endpoint", async ({ client }) => {
// 		const response = await client.get("/students");

// 		response.assertStatus(403);
// 		response.assertBodyContains({
// 			message: "Admin rights required",
// 		});
// 	});

// 	test("unauthenticated user cannot access students endpoint", async ({
// 		client,
// 	}) => {
// 		const response = await client.get("/students");

// 		response.assertStatus(401);
// 	});

// 	test("admin can detach student from school", async ({ client, assert }) => {
// 		const response = await client.patch(`/students/${student1.id}/detach`);

// 		response.assertStatus(200);
// 		response.assertBodyContains({
// 			message: "Student detached from school successfully",
// 		});

// 		const body = response.body();
// 		assert.equal(body.student.id, student1.id);
// 		assert.isNull(body.student.schoolId);
// 		assert.isNull(body.student.groupId);
// 		assert.equal(body.student.level, 1);
// 		assert.equal(body.student.points, 0);

// 		// Vérifier en base que l'étudiant a été détaché
// 		await student1.refresh();
// 		assert.isNull(student1.schoolId);
// 		assert.isNull(student1.groupId);
// 		assert.equal(student1.level, 1);
// 		assert.equal(student1.points, 0);
// 		assert.isTrue(student1.isActive);
// 	});

// 	test("cannot detach student from another school", async ({ client }) => {
// 		// Créer un étudiant dans school2
// 		const otherStudent = await User.create({
// 			email: "otherstudent@test.com",
// 			password: "Password123!",
// 			firstName: "Other",
// 			lastName: "Student",
// 			schoolId: school2.id,
// 			role: "STUDENT",
// 			isActive: true,
// 			level: 2,
// 			points: 150,
// 		});

// 		// Configurer le contexte pour school1 mais essayer de détacher un étudiant de school2
// 		const response = await client.patch(`/students/${otherStudent.id}/detach`);

// 		response.assertStatus(404);
// 		response.assertBodyContains({
// 			message: "Student not found",
// 		});
// 	});

// 	test("cannot detach non-existent student", async ({ client }) => {
// 		const fakeStudentId = "00000000-0000-0000-0000-000000000000";

// 		const response = await client.patch(`/students/${fakeStudentId}/detach`);

// 		response.assertStatus(404);
// 		response.assertBodyContains({
// 			message: "Student not found",
// 		});
// 	});

// 	test("cannot detach inactive student", async ({ client }) => {
// 		const inactiveStudent = await User.create({
// 			email: "inactive@test.com",
// 			password: "Password123!",
// 			firstName: "Inactive",
// 			lastName: "Student",
// 			schoolId: school1.id,
// 			role: "STUDENT",
// 			isActive: false,
// 			level: 1,
// 			points: 0,
// 		});

// 		const response = await client.patch(
// 			`/students/${inactiveStudent.id}/detach`,
// 		);

// 		response.assertStatus(400);
// 		response.assertBodyContains({
// 			message: "Student is already inactive",
// 		});
// 	});

// 	test("student cannot detach themselves", async ({ client }) => {
// 		const response = await client.patch(`/students/${student1.id}/detach`);

// 		response.assertStatus(403);
// 		response.assertBodyContains({
// 			message: "Admin rights required",
// 		});
// 	});

// 	test("unauthenticated user cannot detach student", async ({ client }) => {
// 		const response = await client.patch(`/students/${student1.id}/detach`);

// 		response.assertStatus(401);
// 	});

// 	test("invalid token cannot access students endpoint", async ({ client }) => {
// 		const response = await client.get("/students").bearerToken("invalid-token");

// 		response.assertStatus(401);
// 	});

// 	test("invalid token cannot detach student", async ({ client }) => {
// 		const response = await client
// 			.patch(`/students/${student1.id}/detach`)
// 			.bearerToken("invalid-token");

// 		response.assertStatus(401);
// 	});
// });
