import limiter from "@adonisjs/limiter/services/main";
import { test } from "@japa/runner";
import Group from "#models/group";
import School from "#models/school";
import User from "#models/user";

test.group("User Model", (group) => {
	let school: School;
	let group1: Group;

	group.setup(async () => {
		school = await School.create({
			name: "Test School User Model",
			slug: "test-school-user-model",
		});

		group1 = await Group.create({
			name: "Test Group",
			schoolId: school.id,
		});
	});

	group.teardown(async () => {
		await User.query().delete();
		await Group.query().delete();
		await School.query().delete();
		await limiter.clear(["memory"]);
	});

	test("isDetached returns true when schoolId is null", async ({ assert }) => {
		const user = await User.create({
			email: "detached.user@test.com",
			password: "Password123!",
			schoolId: null,
			role: "STUDENT",
			isActive: true,
			level: 1,
			points: 0,
		});

		assert.isTrue(user.isDetached());
	});

	test("isDetached returns false when schoolId is set", async ({ assert }) => {
		const user = await User.create({
			email: "attached.user@test.com",
			password: "Password123!",
			schoolId: school.id,
			role: "STUDENT",
			isActive: true,
			level: 1,
			points: 0,
		});

		assert.isFalse(user.isDetached());
	});

	test("needsSchoolAttachment returns true for active detached student", async ({
		assert,
	}) => {
		const user = await User.create({
			email: "needsattach.user@test.com",
			password: "Password123!",
			schoolId: null,
			role: "STUDENT",
			isActive: true,
			level: 1,
			points: 0,
		});

		assert.isTrue(user.needsSchoolAttachment());
	});

	test("needsSchoolAttachment returns false for inactive student", async ({
		assert,
	}) => {
		const user = await User.create({
			email: "inactive.user@test.com",
			password: "Password123!",
			schoolId: null,
			role: "STUDENT",
			isActive: false,
			level: 1,
			points: 0,
		});

		assert.isFalse(user.needsSchoolAttachment());
	});

	test("needsSchoolAttachment returns false for admin", async ({ assert }) => {
		const user = await User.create({
			email: "admin.user@test.com",
			password: "Password123!",
			schoolId: null,
			role: "ADMIN",
			isActive: true,
			level: 1,
			points: 0,
		});

		assert.isFalse(user.needsSchoolAttachment());
	});

	test("needsSchoolAttachment returns false for student with school", async ({
		assert,
	}) => {
		const user = await User.create({
			email: "withschool.user@test.com",
			password: "Password123!",
			schoolId: school.id,
			role: "STUDENT",
			isActive: true,
			level: 1,
			points: 0,
		});

		assert.isFalse(user.needsSchoolAttachment());
	});

	test("detachFromSchool resets all school-related fields", async ({
		assert,
	}) => {
		const user = await User.create({
			email: "todetach.user@test.com",
			password: "Password123!",
			schoolId: school.id,
			groupId: group1.id,
			role: "STUDENT",
			isActive: true,
			level: 5,
			points: 1000,
		});

		await user.detachFromSchool();

		assert.isNull(user.schoolId);
		assert.isNull(user.groupId);
		assert.equal(user.level, 1);
		assert.equal(user.points, 0);
		assert.isTrue(user.isActive);
	});

	test("canManageSchool returns true for superadmin", async ({ assert }) => {
		const superAdmin = await User.create({
			email: "superadmin.user@test.com",
			password: "Password123!",
			schoolId: school.id,
			role: "SUPERADMIN",
			isActive: true,
			level: 1,
			points: 0,
		});

		assert.isTrue(superAdmin.canManageSchool(school.id));
		assert.isTrue(superAdmin.canManageSchool("any-other-school-id"));
	});

	test("canManageSchool returns true for admin of same school", async ({
		assert,
	}) => {
		const admin = await User.create({
			email: "admin.same@test.com",
			password: "Password123!",
			schoolId: school.id,
			role: "ADMIN",
			isActive: true,
			level: 1,
			points: 0,
		});

		assert.isTrue(admin.canManageSchool(school.id));
	});

	test("canManageSchool returns false for admin of different school", async ({
		assert,
	}) => {
		const otherSchool = await School.create({
			name: "Other School",
			slug: "other-school",
		});

		const admin = await User.create({
			email: "admin.different@test.com",
			password: "Password123!",
			schoolId: school.id,
			role: "ADMIN",
			isActive: true,
			level: 1,
			points: 0,
		});

		assert.isFalse(admin.canManageSchool(otherSchool.id));
	});

	test("canManageSchool returns false for student", async ({ assert }) => {
		const student = await User.create({
			email: "student.user@test.com",
			password: "Password123!",
			schoolId: school.id,
			role: "STUDENT",
			isActive: true,
			level: 1,
			points: 0,
		});

		assert.isFalse(student.canManageSchool(school.id));
	});

	test("displayName returns full name when both names are present", async ({
		assert,
	}) => {
		const user = await User.create({
			email: "fullname.user@test.com",
			password: "Password123!",
			firstName: "John",
			lastName: "Doe",
			schoolId: school.id,
			role: "STUDENT",
			isActive: true,
			level: 1,
			points: 0,
		});

		assert.equal(user.displayName, "John Doe");
	});

	test("displayName returns email when no names are present", async ({
		assert,
	}) => {
		const user = await User.create({
			email: "noname.user@test.com",
			password: "Password123!",
			firstName: null,
			lastName: null,
			schoolId: school.id,
			role: "STUDENT",
			isActive: true,
			level: 1,
			points: 0,
		});

		assert.equal(user.displayName, "noname.user@test.com");
	});

	test("initials returns first letters when both names are present", async ({
		assert,
	}) => {
		const user = await User.create({
			email: "initials.user@test.com",
			password: "Password123!",
			firstName: "John",
			lastName: "Doe",
			schoolId: school.id,
			role: "STUDENT",
			isActive: true,
			level: 1,
			points: 0,
		});

		assert.equal(user.initials, "JD");
	});

	test("initials returns email first letter when no names are present", async ({
		assert,
	}) => {
		const user = await User.create({
			email: "initials2.user@test.com",
			password: "Password123!",
			firstName: null,
			lastName: null,
			schoolId: school.id,
			role: "STUDENT",
			isActive: true,
			level: 1,
			points: 0,
		});

		assert.equal(user.initials, "I");
	});
});
