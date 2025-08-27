import {
	IconHome,
	IconMapPin,
	IconSettings,
	IconShoppingBag,
	IconTrophy,
	IconUsers,
	IconUsersGroup,
} from "@tabler/icons-react";

export const pageTitles: Record<string, string> = {
	"/users": "Utilisateurs",
	"/home": "Accueil",
	"/quests": "Quêtes",
	"/schools": "Écoles",
	"/leaderboard": "Classement",
};

export const data = {
	admin: [
		{ name: "Accueil", url: "/home", icon: IconHome },
		{ name: "Quêtes", url: "/quests", icon: IconMapPin },
		{ name: "Utilisateurs", url: "/users", icon: IconUsers },
		{ name: "Groupes", url: "/groups", icon: IconUsersGroup },
		{ name: "Marketplace", url: "/marketplace", icon: IconShoppingBag },
		{ name: "Leaderboard", url: "/leaderboard", icon: IconTrophy },
		{ name: "Paramètres école", url: "/settings", icon: IconSettings },
	],

	student: [
		{ name: "Accueil", url: "/home", icon: IconHome },
		{ name: "Quêtes", url: "/quests", icon: IconMapPin },
		{ name: "Marketplace", url: "/marketplace", icon: IconShoppingBag },
		{ name: "Classement", url: "/leaderboard", icon: IconTrophy },
	],
};
