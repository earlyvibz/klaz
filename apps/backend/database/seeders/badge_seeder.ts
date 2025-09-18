import { BaseSeeder } from "@adonisjs/lucid/seeders";
import Badge from "#models/badge";

export default class extends BaseSeeder {
	async run() {
		await Badge.createMany([
			{
				name: "Premier Pas",
				description: "Complétez votre première quête",
				icon: "🌟",
				imageUrl: null,
				color: "#10B981",
				requiredQuests: 1,
				badgeType: "milestone",
			},
			{
				name: "Super Étudiant",
				description: "Atteignez le niveau 5",
				icon: "🎓",
				imageUrl: null,
				color: "#3B82F6",
				requiredLevel: 5,
				badgeType: "achievement",
			},
			{
				name: "Explorateur",
				description: "Complétez 10 quêtes",
				icon: "🗺️",
				imageUrl: null,
				color: "#8B5CF6",
				requiredQuests: 10,
				badgeType: "milestone",
			},
			{
				name: "Chasseur de Points",
				description: "Accumulez 1000 points",
				icon: "💎",
				imageUrl: null,
				color: "#F59E0B",
				requiredPoints: 1000,
				badgeType: "achievement",
			},
			{
				name: "Maître Étudiant",
				description: "Atteignez le niveau 10",
				icon: "👑",
				imageUrl: null,
				color: "#EF4444",
				requiredLevel: 10,
				badgeType: "achievement",
			},
			{
				name: "Vétéran",
				description: "Complétez 50 quêtes",
				icon: "🏆",
				imageUrl: null,
				color: "#DC2626",
				requiredQuests: 50,
				badgeType: "milestone",
			},
			{
				name: "Collectionneur",
				description: "Accumulez 5000 points",
				icon: "💰",
				imageUrl: null,
				color: "#059669",
				requiredPoints: 5000,
				badgeType: "achievement",
			},
			{
				name: "Légende",
				description: "Atteignez le niveau 20",
				icon: "⚡",
				imageUrl: null,
				color: "#7C3AED",
				requiredLevel: 20,
				badgeType: "achievement",
			},
		]);
	}
}
