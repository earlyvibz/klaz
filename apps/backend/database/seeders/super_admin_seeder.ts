import { BaseSeeder } from "@adonisjs/lucid/seeders";
import Group from "#models/group";
import School from "#models/school";
import User from "#models/user";

export default class extends BaseSeeder {
	static environment = ["local", "development"];

	async run() {
		// Créer des écoles de démonstration
		const demoSchool = await School.firstOrCreate(
			{ slug: "demo-school" },
			{
				name: "École Démonstration",
				slug: "demo-school",
			},
		);

		const testSchool = await School.firstOrCreate(
			{ slug: "test-school" },
			{
				name: "École de Test",
				slug: "test-school",
			},
		);

		// Créer super admin global
		await User.firstOrCreate(
			{ email: "superadmin@klaz.fr" },
			{
				firstName: "Super",
				lastName: "Admin",
				email: "superadmin@klaz.fr",
				password: "SuperAdmin123!",
				role: "SUPERADMIN",
				schoolId: demoSchool.id,
				isActive: true,
				level: 1,
				points: 0,
				failedLoginAttempts: 0,
				emailVerified: true,
			},
		);

		// Créer admin de l'école de démo
		await User.firstOrCreate(
			{ email: "admin@demo-school.com" },
			{
				firstName: "Admin",
				lastName: "Demo",
				email: "admin@demo-school.com",
				password: "Admin123!",
				role: "ADMIN",
				schoolId: demoSchool.id,
				isActive: true,
				level: 1,
				points: 0,
				failedLoginAttempts: 0,
				emailVerified: true,
			},
		);

		// Créer admin de l'école de test
		await User.firstOrCreate(
			{ email: "admin@test-school.com" },
			{
				firstName: "Admin",
				lastName: "Test",
				email: "admin@test-school.com",
				password: "Admin123!",
				role: "ADMIN",
				schoolId: testSchool.id,
				isActive: true,
				level: 1,
				points: 0,
				failedLoginAttempts: 0,
				emailVerified: true,
			},
		);

		// Créer des groupes pour l'école de démo
		const group6A = await Group.firstOrCreate(
			{ name: "6A", schoolId: demoSchool.id },
			{
				name: "6A",
				schoolId: demoSchool.id,
			},
		);

		const group6B = await Group.firstOrCreate(
			{ name: "6B", schoolId: demoSchool.id },
			{
				name: "6B",
				schoolId: demoSchool.id,
			},
		);

		const group5A = await Group.firstOrCreate(
			{ name: "5A", schoolId: demoSchool.id },
			{
				name: "5A",
				schoolId: demoSchool.id,
			},
		);

		// Créer des étudiants activés
		const activeStudents = [
			{
				email: "marie.dupont@demo-school.com",
				firstName: "Marie",
				lastName: "Dupont",
				level: 6,
				points: 1250,
				groupId: group6A.id,
			},
			{
				email: "pierre.martin@demo-school.com",
				firstName: "Pierre",
				lastName: "Martin",
				level: 6,
				points: 980,
				groupId: group6A.id,
			},
			{
				email: "sarah.bernard@demo-school.com",
				firstName: "Sarah",
				lastName: "Bernard",
				level: 6,
				points: 1800,
				groupId: group6A.id,
			},
			{
				email: "lucas.petit@demo-school.com",
				firstName: "Lucas",
				lastName: "Petit",
				level: 6,
				points: 750,
				groupId: group6A.id,
			},
			{
				email: "emma.rousseau@demo-school.com",
				firstName: "Emma",
				lastName: "Rousseau",
				level: 6,
				points: 1450,
				groupId: group6A.id,
			},
			{
				email: "alex.durand@demo-school.com",
				firstName: "Alex",
				lastName: "Durand",
				level: 6,
				points: 890,
				groupId: group6B.id,
			},
			{
				email: "chloe.blanc@demo-school.com",
				firstName: "Chloé",
				lastName: "Blanc",
				level: 6,
				points: 1320,
				groupId: group6B.id,
			},
			{
				email: "noah.lopez@demo-school.com",
				firstName: "Noah",
				lastName: "Lopez",
				level: 6,
				points: 1100,
				groupId: group6B.id,
			},
			{
				email: "lea.garcia@demo-school.com",
				firstName: "Léa",
				lastName: "Garcia",
				level: 6,
				points: 1550,
				groupId: group6B.id,
			},
			{
				email: "hugo.martinez@demo-school.com",
				firstName: "Hugo",
				lastName: "Martinez",
				level: 6,
				points: 950,
				groupId: group6B.id,
			},
			{
				email: "jade.rodriguez@demo-school.com",
				firstName: "Jade",
				lastName: "Rodriguez",
				level: 5,
				points: 1750,
				groupId: group5A.id,
			},
			{
				email: "mael.hernandez@demo-school.com",
				firstName: "Maël",
				lastName: "Hernandez",
				level: 5,
				points: 1230,
				groupId: group5A.id,
			},
			{
				email: "louise.wilson@demo-school.com",
				firstName: "Louise",
				lastName: "Wilson",
				level: 5,
				points: 1680,
				groupId: group5A.id,
			},
			{
				email: "arthur.anderson@demo-school.com",
				firstName: "Arthur",
				lastName: "Anderson",
				level: 5,
				points: 1020,
				groupId: group5A.id,
			},
			{
				email: "camille.thomas@demo-school.com",
				firstName: "Camille",
				lastName: "Thomas",
				level: 5,
				points: 1490,
				groupId: group5A.id,
			},
		];

		for (const student of activeStudents) {
			await User.firstOrCreate(
				{ email: student.email },
				{
					...student,
					password: "Student123!",
					role: "STUDENT",
					schoolId: demoSchool.id,
					isActive: true,
					failedLoginAttempts: 0,
					emailVerified: true,
				},
			);
		}
	}
}
