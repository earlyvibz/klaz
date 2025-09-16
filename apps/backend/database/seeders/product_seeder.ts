import { BaseSeeder } from "@adonisjs/lucid/seeders";
import Product from "#models/product";
import School from "#models/school";

export default class extends BaseSeeder {
	async run() {
		// Get the HEC school to associate products with
		const school = await School.query().where("slug", "hec").first();
		if (!school) {
			console.log("HEC school not found. Please create the HEC school first.");
			return;
		}

		const products = [
			{
				title: "Sweat-shirt Klaz",
				description:
					"Sweat-shirt officiel Klaz avec logo brodé, 100% coton bio",
				image:
					"https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500",
				pricePoints: 500,
				supply: 25,
				schoolId: school.id,
				isActive: true,
			},
			{
				title: "Mug Klaz",
				description:
					"Mug en céramique avec logo Klaz, parfait pour le café du matin",
				image:
					"https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=500",
				pricePoints: 150,
				supply: 50,
				schoolId: school.id,
				isActive: true,
			},
			{
				title: "Stylo Klaz",
				description: "Stylo bille premium avec logo Klaz gravé",
				image:
					"https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?w=500",
				pricePoints: 75,
				supply: 100,
				schoolId: school.id,
				isActive: true,
			},
			{
				title: "Casquette Klaz",
				description: "Casquette ajustable avec broderie Klaz",
				image:
					"https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500",
				pricePoints: 200,
				supply: 30,
				schoolId: school.id,
				isActive: true,
			},
			{
				title: "Carnet Klaz",
				description: "Carnet A5 ligné avec couverture en cuir synthétique",
				image:
					"https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500",
				pricePoints: 120,
				supply: 40,
				schoolId: school.id,
				isActive: true,
			},
			{
				title: "Badge Klaz",
				description: "Pin's collectible Klaz en métal émaillé",
				image:
					"https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=500",
				pricePoints: 50,
				supply: 200,
				schoolId: school.id,
				isActive: true,
			},
		];

		await Product.createMany(products);
		console.log("Products seeded successfully!");
	}
}
