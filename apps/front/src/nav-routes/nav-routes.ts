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
		{ name: "Accueil", url: "/admin/home", icon: IconHome },
		{ name: "Quêtes", url: "/admin/quests", icon: IconMapPin },
		{ name: "Utilisateurs", url: "/admin/users", icon: IconUsers },
		{ name: "Groupes", url: "/admin/groups", icon: IconUsersGroup },
		{ name: "Marketplace", url: "/admin/marketplace", icon: IconShoppingBag },
		{ name: "Leaderboard", url: "/admin/leaderboard", icon: IconTrophy },
		{ name: "Paramètres école", url: "/admin/settings", icon: IconSettings },
	],

	student: [
		{ name: "Accueil", url: "/home", icon: IconHome },
		{ name: "Quêtes", url: "/quests", icon: IconMapPin },
		{ name: "Marketplace", url: "/marketplace", icon: IconShoppingBag },
		{ name: "Classement", url: "/leaderboard", icon: IconTrophy },
	],
};
