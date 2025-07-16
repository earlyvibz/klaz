import {
	IconActivity,
	IconHome,
	IconMapPin,
	IconPlus,
	IconSchool,
	IconSettings,
	IconShoppingBag,
	IconTrophy,
	IconUser,
	IconUsers,
	IconUsersGroup,
} from "@tabler/icons-react";

export const pageTitles: Record<string, string> = {
	"/users": "Utilisateurs",
	"/home": "Accueil",
	"/quests": "Quêtes",
	"/schools": "Écoles",
};

export const data = {
	superAdmin: [
		{ name: "Accueil", url: "/home", icon: IconHome },
		{ name: "Écoles", url: "/schools", icon: IconSchool },
		{ name: "Utilisateurs", url: "/users", icon: IconUsers },
		{ name: "Quêtes globales", url: "/global-quests", icon: IconMapPin },
		{ name: "Logs / Activité", url: "/activity", icon: IconActivity },
		{ name: "Paramètres", url: "/settings", icon: IconSettings },
	],

	admin: [
		{ name: "Accueil", url: "/home", icon: IconHome },
		{ name: "Quêtes", url: "/quests", icon: IconMapPin },
		{ name: "Créer une quête", url: "/quests/new", icon: IconPlus },
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
		{ name: "Profil", url: "/profile", icon: IconUser },
	],
};
