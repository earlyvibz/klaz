import { BaseSeeder } from "@adonisjs/lucid/seeders";
import School from "#models/school";

export default class extends BaseSeeder {
	async run() {
		// Créer des écoles de test correspondant aux subdomains configurés
		await School.createMany([
			{
				name: "HEC Paris",
				slug: "hec",
			},
			{
				name: "ESSEC Business School",
				slug: "essec",
			},
			{
				name: "INSEAD",
				slug: "insead",
			},
			{
				name: "École Polytechnique",
				slug: "polytechnique",
			},
			{
				name: "École Centrale Paris",
				slug: "centrale",
			},
		]);
	}
}
