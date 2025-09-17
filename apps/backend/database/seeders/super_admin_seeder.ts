import { BaseSeeder } from "@adonisjs/lucid/seeders";
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
				schoolId: null,
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

		// Créer des étudiants activés
		const activeStudents = [
			{
				email: "marie.dupont@demo-school.com",
				firstName: "Marie",
				lastName: "Dupont",
				level: 6,
				points: 1250,
			},
			{
				email: "pierre.martin@demo-school.com",
				firstName: "Pierre",
				lastName: "Martin",
				level: 6,
				points: 980,
			},
			{
				email: "sarah.bernard@demo-school.com",
				firstName: "Sarah",
				lastName: "Bernard",
				level: 6,
				points: 1800,
			},
			{
				email: "lucas.petit@demo-school.com",
				firstName: "Lucas",
				lastName: "Petit",
				level: 6,
				points: 750,
			},
			{
				email: "emma.rousseau@demo-school.com",
				firstName: "Emma",
				lastName: "Rousseau",
				level: 6,
				points: 1450,
			},
			{
				email: "alex.durand@demo-school.com",
				firstName: "Alex",
				lastName: "Durand",
				level: 6,
				points: 890,
			},
			{
				email: "chloe.blanc@demo-school.com",
				firstName: "Chloé",
				lastName: "Blanc",
				level: 6,
				points: 1320,
			},
			{
				email: "noah.lopez@demo-school.com",
				firstName: "Noah",
				lastName: "Lopez",
				level: 6,
				points: 1100,
			},
			{
				email: "lea.garcia@demo-school.com",
				firstName: "Léa",
				lastName: "Garcia",
				level: 6,
				points: 1550,
			},
			{
				email: "hugo.martinez@demo-school.com",
				firstName: "Hugo",
				lastName: "Martinez",
				level: 6,
				points: 950,
			},
			{
				email: "jade.rodriguez@demo-school.com",
				firstName: "Jade",
				lastName: "Rodriguez",
				level: 5,
				points: 1750,
			},
			{
				email: "mael.hernandez@demo-school.com",
				firstName: "Maël",
				lastName: "Hernandez",
				level: 5,
				points: 1230,
			},
			{
				email: "louise.wilson@demo-school.com",
				firstName: "Louise",
				lastName: "Wilson",
				level: 5,
				points: 1680,
			},
			{
				email: "arthur.anderson@demo-school.com",
				firstName: "Arthur",
				lastName: "Anderson",
				level: 5,
				points: 1020,
			},
			{
				email: "camille.thomas@demo-school.com",
				firstName: "Camille",
				lastName: "Thomas",
				level: 5,
				points: 1490,
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
