import { BaseSeeder } from "@adonisjs/lucid/seeders";
import Group from "#models/group";
import Quest from "#models/quest";
import Reward from "#models/reward";
import School from "#models/school";
import User from "#models/user";

export default class extends BaseSeeder {
	async run() {
		// Créer des écoles de démonstration
		const demoSchool = await School.firstOrCreate(
			{ slug: "demo-school" },
			{
				name: "École de Démonstration",
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

		// Créer des groupes
		const group6A = await Group.firstOrCreate(
			{ name: "6ème A", schoolId: demoSchool.id },
			{
				name: "6ème A",
				schoolId: demoSchool.id,
			},
		);

		const group6B = await Group.firstOrCreate(
			{ name: "6ème B", schoolId: demoSchool.id },
			{
				name: "6ème B",
				schoolId: demoSchool.id,
			},
		);

		const group5A = await Group.firstOrCreate(
			{ name: "5ème A", schoolId: demoSchool.id },
			{
				name: "5ème A",
				schoolId: demoSchool.id,
			},
		);

		const testGroup = await Group.firstOrCreate(
			{ name: "Test Group", schoolId: testSchool.id },
			{
				name: "Test Group",
				schoolId: testSchool.id,
			},
		);

		// Créer un super admin
		await User.firstOrCreate(
			{ email: "superadmin@klaz.com" },
			{
				email: "superadmin@klaz.com",
				password: "Password123!",
				fullName: "Super Admin",
				role: "SUPERADMIN",
				schoolId: demoSchool.id,
				isActive: true,
				level: 1,
				points: 0,
				failedLoginAttempts: 0,
				emailVerified: true,
			},
		);

		// Créer des admins d'école
		await User.firstOrCreate(
			{ email: "admin@demo-school.com" },
			{
				email: "admin@demo-school.com",
				password: "Password123!",
				fullName: "Admin Demo School",
				role: "ADMIN",
				schoolId: demoSchool.id,
				isActive: true,
				level: 1,
				points: 0,
				failedLoginAttempts: 0,
				emailVerified: true,
			},
		);

		await User.firstOrCreate(
			{ email: "admin@test-school.com" },
			{
				email: "admin@test-school.com",
				password: "Password123!",
				fullName: "Admin Test School",
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
				fullName: "Marie Dupont",
				level: 6,
				points: 1250,
				groupId: group6A.id,
			},
			{
				email: "pierre.martin@demo-school.com",
				fullName: "Pierre Martin",
				level: 6,
				points: 980,
				groupId: group6A.id,
			},
			{
				email: "sarah.bernard@demo-school.com",
				fullName: "Sarah Bernard",
				level: 6,
				points: 1800,
				groupId: group6B.id,
			},
			{
				email: "lucas.petit@demo-school.com",
				fullName: "Lucas Petit",
				level: 5,
				points: 2100,
				groupId: group5A.id,
			},
			{
				email: "emma.rousseau@demo-school.com",
				fullName: "Emma Rousseau",
				level: 5,
				points: 750,
				groupId: group5A.id,
			},
			// Nouveaux étudiants pour tester la pagination
			{
				email: "alex.durand@demo-school.com",
				fullName: "Alex Durand",
				level: 6,
				points: 1350,
				groupId: group6A.id,
			},
			{
				email: "chloe.blanc@demo-school.com",
				fullName: "Chloé Blanc",
				level: 6,
				points: 1120,
				groupId: group6A.id,
			},
			{
				email: "noah.lopez@demo-school.com",
				fullName: "Noah Lopez",
				level: 6,
				points: 890,
				groupId: group6B.id,
			},
			{
				email: "lea.garcia@demo-school.com",
				fullName: "Léa Garcia",
				level: 6,
				points: 1670,
				groupId: group6B.id,
			},
			{
				email: "hugo.martinez@demo-school.com",
				fullName: "Hugo Martinez",
				level: 5,
				points: 1440,
				groupId: group5A.id,
			},
			{
				email: "jade.rodriguez@demo-school.com",
				fullName: "Jade Rodriguez",
				level: 5,
				points: 1230,
				groupId: group5A.id,
			},
			{
				email: "mael.hernandez@demo-school.com",
				fullName: "Maël Hernandez",
				level: 6,
				points: 2250,
				groupId: group6A.id,
			},
			{
				email: "louise.wilson@demo-school.com",
				fullName: "Louise Wilson",
				level: 6,
				points: 1580,
				groupId: group6B.id,
			},
			{
				email: "arthur.anderson@demo-school.com",
				fullName: "Arthur Anderson",
				level: 5,
				points: 1890,
				groupId: group5A.id,
			},
			{
				email: "camille.thomas@demo-school.com",
				fullName: "Camille Thomas",
				level: 6,
				points: 1045,
				groupId: group6A.id,
			},
			{
				email: "gabriel.jackson@demo-school.com",
				fullName: "Gabriel Jackson",
				level: 6,
				points: 1720,
				groupId: group6B.id,
			},
			{
				email: "alice.white@demo-school.com",
				fullName: "Alice White",
				level: 5,
				points: 930,
				groupId: group5A.id,
			},
			{
				email: "enzo.harris@demo-school.com",
				fullName: "Enzo Harris",
				level: 6,
				points: 2050,
				groupId: group6A.id,
			},
			{
				email: "manon.clark@demo-school.com",
				fullName: "Manon Clark",
				level: 6,
				points: 1380,
				groupId: group6B.id,
			},
			{
				email: "raphael.lewis@demo-school.com",
				fullName: "Raphaël Lewis",
				level: 5,
				points: 1560,
				groupId: group5A.id,
			},
			{
				email: "zoe.robinson@demo-school.com",
				fullName: "Zoé Robinson",
				level: 6,
				points: 1290,
				groupId: group6A.id,
			},
			{
				email: "nolan.walker@demo-school.com",
				fullName: "Nolan Walker",
				level: 6,
				points: 1810,
				groupId: group6B.id,
			},
			{
				email: "clara.hall@demo-school.com",
				fullName: "Clara Hall",
				level: 5,
				points: 1150,
				groupId: group5A.id,
			},
			{
				email: "mathis.allen@demo-school.com",
				fullName: "Mathis Allen",
				level: 6,
				points: 2180,
				groupId: group6A.id,
			},
			{
				email: "lina.young@demo-school.com",
				fullName: "Lina Young",
				level: 6,
				points: 1420,
				groupId: group6B.id,
			},
			{
				email: "antoine.king@demo-school.com",
				fullName: "Antoine King",
				level: 5,
				points: 1680,
				groupId: group5A.id,
			},
			{
				email: "eva.wright@demo-school.com",
				fullName: "Eva Wright",
				level: 6,
				points: 1095,
				groupId: group6A.id,
			},
			{
				email: "maxime.lopez@demo-school.com",
				fullName: "Maxime Lopez",
				level: 6,
				points: 1750,
				groupId: group6B.id,
			},
			{
				email: "sofia.hill@demo-school.com",
				fullName: "Sofia Hill",
				level: 5,
				points: 1320,
				groupId: group5A.id,
			},
			{
				email: "tom.green@demo-school.com",
				fullName: "Tom Green",
				level: 6,
				points: 1980,
				groupId: group6A.id,
			},
		];

		for (const student of activeStudents) {
			await User.firstOrCreate(
				{ email: student.email },
				{
					email: student.email,
					password: "Student123!",
					fullName: student.fullName,
					role: "STUDENT",
					schoolId: demoSchool.id,
					groupId: student.groupId,
					isActive: true,
					level: student.level,
					points: student.points,
					failedLoginAttempts: 0,
					emailVerified: true,
				},
			);
		}

		// Créer des étudiants non activés (simule des inscriptions en attente)
		const inactiveStudents = [
			{
				email: "julie.moreau@demo-school.com",
				fullName: "Julie Moreau",
				level: 6,
				points: 0,
				groupId: group6A.id,
			},
			{
				email: "thomas.laurent@demo-school.com",
				fullName: "Thomas Laurent",
				level: 6,
				points: 0,
				groupId: group6B.id,
			},
			{
				email: "lea.simon@demo-school.com",
				fullName: "Lea Simon",
				level: 5,
				points: 0,
				groupId: group5A.id,
			},
		];

		for (const student of inactiveStudents) {
			await User.firstOrCreate(
				{ email: student.email },
				{
					email: student.email,
					password: "Student123!",
					fullName: student.fullName,
					role: "STUDENT",
					schoolId: demoSchool.id,
					groupId: student.groupId,
					isActive: false,
					level: student.level,
					points: student.points,
					failedLoginAttempts: 0,
					emailVerified: false,
				},
			);
		}

		// Créer des étudiants avec des problèmes de connexion
		await User.firstOrCreate(
			{ email: "blocked@demo-school.com" },
			{
				email: "blocked@demo-school.com",
				password: "Student123!",
				fullName: "Étudiant Bloqué",
				role: "STUDENT",
				schoolId: demoSchool.id,
				groupId: group6A.id,
				isActive: true,
				level: 6,
				points: 500,
				failedLoginAttempts: 5,
				emailVerified: true,
			},
		);

		// Créer des étudiants dans l'école de test
		await User.firstOrCreate(
			{ email: "student@test-school.com" },
			{
				email: "student@test-school.com",
				password: "Student123!",
				fullName: "Étudiant Test",
				role: "STUDENT",
				schoolId: testSchool.id,
				groupId: testGroup.id,
				isActive: true,
				level: 4,
				points: 300,
				failedLoginAttempts: 0,
				emailVerified: true,
			},
		);

		// Créer des quêtes de base
		await Quest.firstOrCreate(
			{ title: "Première Mission", schoolId: demoSchool.id },
			{
				title: "Première Mission",
				description: "Complétez votre première mission pour gagner des points",
				type: "UGC",
				points: 100,
				schoolId: demoSchool.id,
				validationType: "MANUAL",
			},
		);

		await Quest.firstOrCreate(
			{ title: "Mission Mathématiques", schoolId: demoSchool.id },
			{
				title: "Mission Mathématiques",
				description: "Résolvez 10 exercices de mathématiques",
				type: "UGC",
				points: 250,
				schoolId: demoSchool.id,
				validationType: "MANUAL",
			},
		);

		await Quest.firstOrCreate(
			{ title: "Mission Lecture", schoolId: demoSchool.id },
			{
				title: "Mission Lecture",
				description: "Lisez un livre et rédigez un résumé",
				type: "UGC",
				points: 300,
				schoolId: demoSchool.id,
				validationType: "MANUAL",
			},
		);

		// Créer des récompenses de base
		await Reward.firstOrCreate(
			{ title: "Badge Débutant", schoolId: demoSchool.id },
			{
				title: "Badge Débutant",
				description: "Votre premier badge !",
				cost: 100,
				schoolId: demoSchool.id,
				imageUrl: "",
				stock: 999,
			},
		);

		await Reward.firstOrCreate(
			{ title: "Badge Mathématiques", schoolId: demoSchool.id },
			{
				title: "Badge Mathématiques",
				description: "Expert en mathématiques",
				cost: 500,
				schoolId: demoSchool.id,
				imageUrl: "",
				stock: 999,
			},
		);

		await Reward.firstOrCreate(
			{ title: "Badge Lecteur", schoolId: demoSchool.id },
			{
				title: "Badge Lecteur",
				description: "Grand lecteur",
				cost: 750,
				schoolId: demoSchool.id,
				imageUrl: "",
				stock: 999,
			},
		);

		console.log("✅ Données de test créées avec succès !");
		console.log("👑 Super Admin: superadmin@klaz.com / Password123!");
		console.log("🏫 Admin Demo School: admin@demo-school.com / Password123!");
		console.log("🏫 Admin Test School: admin@test-school.com / Password123!");
		console.log(
			"🎓 Étudiants activés: marie.dupont@demo-school.com, pierre.martin@demo-school.com, etc. / Student123!",
		);
		console.log(
			"❌ Étudiants non activés: julie.moreau@demo-school.com, thomas.laurent@demo-school.com, etc. / Student123!",
		);
		console.log("🚫 Étudiant bloqué: blocked@demo-school.com / Student123!");
	}
}
