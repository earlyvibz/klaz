import { BaseSeeder } from "@adonisjs/lucid/seeders";
import Group from "#models/group";
import Quest from "#models/quest";
import School from "#models/school";
import User from "#models/user";

export default class extends BaseSeeder {
	static environment = ["local", "development"];
	async run() {
		// 1. Créer toutes les écoles (demo + vraies écoles)
		const schools = await this.createSchools();

		// 2. Créer super admin
		await this.createSuperAdmin(schools.demoSchool);

		// 3. Créer admins et étudiants pour écoles demo
		await this.createDemoSchoolUsers(schools.demoSchool, schools.testSchool);

		// 4. Créer admin et étudiants pour HEC
		if (schools.hecSchool) {
			await this.createHecUsers(schools.hecSchool);
		}

		// 5. Créer des quêtes d'exemple
		await this.createSampleQuests(
			schools.demoSchool,
			schools.testSchool,
			schools.hecSchool,
		);
	}

	private async createSchools() {
		// Écoles demo
		const demoSchool = await School.firstOrCreate(
			{
				name: "Demo School",
				slug: "demo",
				address: "123 Demo St, Demo City",
				logoUrl: "https://via.placeholder.com/150",
				primaryColor: "#000000",
				secondaryColor: "#FFFFFF",
				description: "A demo school for testing purposes.",
				websiteUrl: "https://demo.com",
				contactEmail: "demo@example.com",
				phone: "+1 234 567 890",
			},
			{
				name: "Demo School",
				slug: "demo",
				address: "123 Demo St, Demo City",
				logoUrl: "https://via.placeholder.com/150",
				primaryColor: "#000000",
				secondaryColor: "#FFFFFF",
				description: "A demo school for testing purposes.",
				websiteUrl: "https://demo.com",
				contactEmail: "demo@example.com",
				phone: "+1 234 567 890",
			},
		);

		const testSchool = await School.firstOrCreate(
			{
				name: "Test School",
				slug: "test",
				address: "456 Test Ave, Test City",
				logoUrl: "https://via.placeholder.com/150",
				primaryColor: "#FF0000",
				secondaryColor: "#00FF00",
				description: "A test school for testing purposes.",
				websiteUrl: "https://test.com",
				contactEmail: "test@example.com",
				phone: "+1 987 654 321",
			},
			{
				name: "Test School",
				slug: "test",
				address: "456 Test Ave, Test City",
				logoUrl: "https://via.placeholder.com/150",
				primaryColor: "#FF0000",
				secondaryColor: "#00FF00",
				description: "A test school for testing purposes.",
				websiteUrl: "https://test.com",
				contactEmail: "test@example.com",
				phone: "+1 987 654 321",
			},
		);

		// Vraies écoles
		const realSchools = await School.createMany([
			{
				name: "HEC Paris",
				slug: "hec",
				address: "1 Rue de la Libération, 78350 Jouy-en-Josas",
				logoUrl:
					"https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/HEC_Paris.svg/1200px-HEC_Paris.svg.png",
				primaryColor: "#003366",
				secondaryColor: "#FF6B35",
				description:
					"HEC Paris est une grande école de commerce française, créée en 1881 et située à Jouy-en-Josas.",
				websiteUrl: "https://www.hec.edu",
				contactEmail: "contact@hec.edu",
				phone: "+33 1 39 67 70 00",
			},
			{
				name: "ESSEC Business School",
				slug: "essec",
				address: "3 Avenue Bernard Hirsch, 95021 Cergy",
				logoUrl:
					"https://www.essec.edu/wp-content/uploads/2020/01/essec-logo.png",
				primaryColor: "#0066CC",
				secondaryColor: "#FFD700",
				description:
					"ESSEC Business School est une grande école de commerce française fondée en 1907.",
				websiteUrl: "https://www.essec.edu",
				contactEmail: "info@essec.edu",
				phone: "+33 1 34 43 30 00",
			},
			{
				name: "INSEAD",
				slug: "insead",
				address: "Boulevard de Constance, 77300 Fontainebleau",
				logoUrl: "https://www.insead.edu/sites/default/files/insead-logo.png",
				primaryColor: "#003D82",
				secondaryColor: "#E31837",
				description:
					"INSEAD est une école de commerce internationale avec des campus en France, Singapour et Abou Dhabi.",
				websiteUrl: "https://www.insead.edu",
				contactEmail: "info@insead.edu",
				phone: "+33 1 60 72 40 00",
			},
			{
				name: "École Polytechnique",
				slug: "polytechnique",
				address: "Route de Saclay, 91128 Palaiseau",
				logoUrl: "https://www.polytechnique.edu/sites/default/files/logo-x.png",
				primaryColor: "#8B0000",
				secondaryColor: "#FFD700",
				description:
					"L'École polytechnique est une grande école d'ingénieurs française, fondée en 1794.",
				websiteUrl: "https://www.polytechnique.edu",
				contactEmail: "communication@polytechnique.edu",
				phone: "+33 1 69 33 33 33",
			},
			{
				name: "École Centrale Paris",
				slug: "centrale",
				address: "Grande Voie des Vignes, 92295 Châtenay-Malabry",
				logoUrl:
					"https://www.centralesupelec.fr/sites/default/files/logo-cs.png",
				primaryColor: "#004080",
				secondaryColor: "#FF9900",
				description:
					"CentraleSupélec est une grande école d'ingénieurs française issue de la fusion de l'École centrale Paris et Supélec.",
				websiteUrl: "https://www.centralesupelec.fr",
				contactEmail: "contact@centralesupelec.fr",
				phone: "+33 1 41 13 10 00",
			},
		]);
		const hecSchool = realSchools.find((s) => s.slug === "hec");

		return { demoSchool, testSchool, hecSchool };
	}

	private async createSuperAdmin(demoSchool: School) {
		await User.firstOrCreate(
			{ email: "superadmin@example.com" },
			{
				firstName: "Super",
				lastName: "Admin",
				email: "superadmin@example.com",
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
	}

	private async createDemoSchoolUsers(demoSchool: School, testSchool: School) {
		// Créer admin pour école demo
		await User.firstOrCreate(
			{ email: "admin@demo.com" },
			{
				firstName: "Admin",
				lastName: "Demo",
				email: "admin@demo.com",
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

		// Créer des groupes pour école demo
		const groupMBA1 = await Group.firstOrCreate(
			{ name: "MBA 1A", schoolId: demoSchool.id },
			{
				name: "MBA 1A",
				schoolId: demoSchool.id,
			},
		);

		const groupMBA2 = await Group.firstOrCreate(
			{ name: "MBA 2A", schoolId: demoSchool.id },
			{
				name: "MBA 2A",
				schoolId: demoSchool.id,
			},
		);

		const groupMSc = await Group.firstOrCreate(
			{ name: "MSc Finance", schoolId: demoSchool.id },
			{
				name: "MSc Finance",
				schoolId: demoSchool.id,
			},
		);

		// Créer des étudiants pour école demo
		const demoStudents = [
			{
				email: "alexandre.dubois@demo.com",
				firstName: "Alexandre",
				lastName: "Dubois",
				level: 8,
				points: 2100,
				groupId: groupMBA1.id,
			},
			{
				email: "charlotte.moreau@demo.com",
				firstName: "Charlotte",
				lastName: "Moreau",
				level: 8,
				points: 1950,
				groupId: groupMBA1.id,
			},
			{
				email: "maxime.lefevre@demo.com",
				firstName: "Maxime",
				lastName: "Lefèvre",
				level: 8,
				points: 2350,
				groupId: groupMBA1.id,
			},
			{
				email: "sophie.laurent@demo.com",
				firstName: "Sophie",
				lastName: "Laurent",
				level: 8,
				points: 1800,
				groupId: groupMBA1.id,
			},
			{
				email: "julien.simon@demo.com",
				firstName: "Julien",
				lastName: "Simon",
				level: 9,
				points: 2800,
				groupId: groupMBA2.id,
			},
			{
				email: "camille.michel@demo.com",
				firstName: "Camille",
				lastName: "Michel",
				level: 9,
				points: 2650,
				groupId: groupMBA2.id,
			},
			{
				email: "thomas.david@demo.com",
				firstName: "Thomas",
				lastName: "David",
				level: 9,
				points: 2450,
				groupId: groupMBA2.id,
			},
			{
				email: "marine.petit@demo.com",
				firstName: "Marine",
				lastName: "Petit",
				level: 9,
				points: 2900,
				groupId: groupMBA2.id,
			},
			{
				email: "antoine.robert@demo.com",
				firstName: "Antoine",
				lastName: "Robert",
				level: 7,
				points: 1650,
				groupId: groupMSc.id,
			},
			{
				email: "clara.richard@demo.com",
				firstName: "Clara",
				lastName: "Richard",
				level: 7,
				points: 1750,
				groupId: groupMSc.id,
			},
			{
				email: "paul.moreau@demo.com",
				firstName: "Paul",
				lastName: "Moreau",
				level: 7,
				points: 1580,
				groupId: groupMSc.id,
			},
			{
				email: "elena.garcia@demo.com",
				firstName: "Elena",
				lastName: "Garcia",
				level: 7,
				points: 1820,
				groupId: groupMSc.id,
			},
		];

		for (const student of demoStudents) {
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

		// Créer admin pour école test
		await User.firstOrCreate(
			{ email: "admin@test.com" },
			{
				firstName: "Admin",
				lastName: "Test",
				email: "admin@test.com",
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

		// Créer des groupes pour école test
		const groupMBA1Test = await Group.firstOrCreate(
			{ name: "MBA 1A", schoolId: testSchool.id },
			{
				name: "MBA 1A",
				schoolId: testSchool.id,
			},
		);

		const groupMBA2Test = await Group.firstOrCreate(
			{ name: "MBA 2A", schoolId: testSchool.id },
			{
				name: "MBA 2A",
				schoolId: testSchool.id,
			},
		);

		const groupMScTest = await Group.firstOrCreate(
			{ name: "MSc Finance", schoolId: testSchool.id },
			{
				name: "MSc Finance",
				schoolId: testSchool.id,
			},
		);

		// Créer des étudiants pour école test
		const testStudents = [
			{
				email: "alexandre.dubois@test.com",
				firstName: "Alexandre",
				lastName: "Dubois",
				level: 8,
				points: 2100,
				groupId: groupMBA1Test.id,
			},
			{
				email: "charlotte.moreau@test.com",
				firstName: "Charlotte",
				lastName: "Moreau",
				level: 8,
				points: 1950,
				groupId: groupMBA1Test.id,
			},
			{
				email: "maxime.lefevre@test.com",
				firstName: "Maxime",
				lastName: "Lefèvre",
				level: 8,
				points: 2350,
				groupId: groupMBA1Test.id,
			},
			{
				email: "sophie.laurent@test.com",
				firstName: "Sophie",
				lastName: "Laurent",
				level: 8,
				points: 1800,
				groupId: groupMBA1Test.id,
			},
			{
				email: "julien.simon@test.com",
				firstName: "Julien",
				lastName: "Simon",
				level: 9,
				points: 2800,
				groupId: groupMBA2Test.id,
			},
			{
				email: "camille.michel@test.com",
				firstName: "Camille",
				lastName: "Michel",
				level: 9,
				points: 2650,
				groupId: groupMBA2Test.id,
			},
			{
				email: "thomas.david@test.com",
				firstName: "Thomas",
				lastName: "David",
				level: 9,
				points: 2450,
				groupId: groupMBA2Test.id,
			},
			{
				email: "marine.petit@test.com",
				firstName: "Marine",
				lastName: "Petit",
				level: 9,
				points: 2900,
				groupId: groupMBA2Test.id,
			},
			{
				email: "antoine.robert@test.com",
				firstName: "Antoine",
				lastName: "Robert",
				level: 7,
				points: 1650,
				groupId: groupMScTest.id,
			},
			{
				email: "clara.richard@test.com",
				firstName: "Clara",
				lastName: "Richard",
				level: 7,
				points: 1750,
				groupId: groupMScTest.id,
			},
			{
				email: "paul.moreau@test.com",
				firstName: "Paul",
				lastName: "Moreau",
				level: 7,
				points: 1580,
				groupId: groupMScTest.id,
			},
			{
				email: "elena.garcia@test.com",
				firstName: "Elena",
				lastName: "Garcia",
				level: 7,
				points: 1820,
				groupId: groupMScTest.id,
			},
		];

		for (const student of testStudents) {
			await User.firstOrCreate(
				{ email: student.email },
				{
					...student,
					password: "Student123!",
					role: "STUDENT",
					schoolId: testSchool.id,
					isActive: true,
					failedLoginAttempts: 0,
					emailVerified: true,
				},
			);
		}
	}

	private async createHecUsers(hecSchool: School) {
		// Créer admin HEC
		await User.firstOrCreate(
			{ email: "admin@hec.edu" },
			{
				firstName: "Admin",
				lastName: "HEC",
				email: "admin@hec.edu",
				password: "Admin123!",
				role: "ADMIN",
				schoolId: hecSchool.id,
				isActive: true,
				level: 1,
				points: 0,
				failedLoginAttempts: 0,
				emailVerified: true,
			},
		);

		// Créer des groupes pour HEC
		const groupMBA1 = await Group.firstOrCreate(
			{ name: "MBA 1A", schoolId: hecSchool.id },
			{
				name: "MBA 1A",
				schoolId: hecSchool.id,
			},
		);

		const groupMBA2 = await Group.firstOrCreate(
			{ name: "MBA 2A", schoolId: hecSchool.id },
			{
				name: "MBA 2A",
				schoolId: hecSchool.id,
			},
		);

		const groupMSc = await Group.firstOrCreate(
			{ name: "MSc Finance", schoolId: hecSchool.id },
			{
				name: "MSc Finance",
				schoolId: hecSchool.id,
			},
		);

		// Créer des étudiants HEC
		const hecStudents = [
			{
				email: "alexandre.dubois@hec.edu",
				firstName: "Alexandre",
				lastName: "Dubois",
				level: 8,
				points: 2100,
				groupId: groupMBA1.id,
			},
			{
				email: "charlotte.moreau@hec.edu",
				firstName: "Charlotte",
				lastName: "Moreau",
				level: 8,
				points: 1950,
				groupId: groupMBA1.id,
			},
			{
				email: "maxime.lefevre@hec.edu",
				firstName: "Maxime",
				lastName: "Lefèvre",
				level: 8,
				points: 2350,
				groupId: groupMBA1.id,
			},
			{
				email: "sophie.laurent@hec.edu",
				firstName: "Sophie",
				lastName: "Laurent",
				level: 8,
				points: 1800,
				groupId: groupMBA1.id,
			},
			{
				email: "julien.simon@hec.edu",
				firstName: "Julien",
				lastName: "Simon",
				level: 9,
				points: 2800,
				groupId: groupMBA2.id,
			},
			{
				email: "camille.michel@hec.edu",
				firstName: "Camille",
				lastName: "Michel",
				level: 9,
				points: 2650,
				groupId: groupMBA2.id,
			},
			{
				email: "thomas.david@hec.edu",
				firstName: "Thomas",
				lastName: "David",
				level: 9,
				points: 2450,
				groupId: groupMBA2.id,
			},
			{
				email: "marine.petit@hec.edu",
				firstName: "Marine",
				lastName: "Petit",
				level: 9,
				points: 2900,
				groupId: groupMBA2.id,
			},
			{
				email: "antoine.robert@hec.edu",
				firstName: "Antoine",
				lastName: "Robert",
				level: 7,
				points: 1650,
				groupId: groupMSc.id,
			},
			{
				email: "clara.richard@hec.edu",
				firstName: "Clara",
				lastName: "Richard",
				level: 7,
				points: 1750,
				groupId: groupMSc.id,
			},
			{
				email: "paul.moreau@hec.edu",
				firstName: "Paul",
				lastName: "Moreau",
				level: 7,
				points: 1580,
				groupId: groupMSc.id,
			},
			{
				email: "elena.garcia@hec.edu",
				firstName: "Elena",
				lastName: "Garcia",
				level: 7,
				points: 1820,
				groupId: groupMSc.id,
			},
		];

		for (const student of hecStudents) {
			await User.firstOrCreate(
				{ email: student.email },
				{
					...student,
					password: "Student123!",
					role: "STUDENT",
					schoolId: hecSchool.id,
					isActive: true,
					failedLoginAttempts: 0,
					emailVerified: true,
				},
			);
		}
	}

	private async createSampleQuests(
		demoSchool: School,
		testSchool: School,
		hecSchool?: School,
	) {
		const questsData = [
			{
				title: "Partage sur LinkedIn",
				description:
					"Partage un post sur LinkedIn parlant de ton expérience à l'école avec le hashtag #MonEcole",
				type: "SOCIAL",
				points: 50,
				validationType: "MANUAL" as const,
			},
			{
				title: "Review Google",
				description:
					"Laisse un avis positif sur Google pour l'école et partage une capture d'écran",
				type: "UGC",
				points: 75,
				validationType: "MANUAL" as const,
			},
			{
				title: "Parrainage étudiant",
				description: "Parraine un nouvel étudiant qui s'inscrit à l'école",
				type: "REFERRAL",
				points: 200,
				validationType: "MANUAL" as const,
			},
			{
				title: "Participation événement carrière",
				description: "Participe à un événement carrière organisé par l'école",
				type: "EVENT",
				points: 100,
				validationType: "MANUAL" as const,
			},
			{
				title: "Video témoignage",
				description:
					"Crée une vidéo de 2-3 minutes parlant de ton parcours et de ton expérience",
				type: "UGC",
				points: 150,
				validationType: "MANUAL" as const,
			},
			{
				title: "Article blog",
				description:
					"Rédige un article de blog sur ton domaine d'expertise en mentionnant l'école",
				type: "UGC",
				points: 120,
				validationType: "MANUAL" as const,
			},
		];

		// Créer les quêtes pour chaque école
		const schools = [demoSchool, testSchool];
		if (hecSchool) schools.push(hecSchool);

		for (const school of schools) {
			for (const questData of questsData) {
				await Quest.firstOrCreate(
					{
						title: questData.title,
						schoolId: school.id,
					},
					{
						...questData,
						schoolId: school.id,
						isActive: true,
					},
				);
			}
		}
	}
}
