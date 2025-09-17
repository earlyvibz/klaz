import {
	IconBell,
	IconChartBar,
	IconClipboardCheck,
	IconHistory,
	IconHome,
	IconMapPin,
	IconReceipt,
	IconSettings,
	IconShoppingBag,
	IconTrophy,
	IconUsers,
} from "@tabler/icons-react";

export const pageTitles: Record<string, string> = {
	"/users": "Utilisateurs",
	"/home": "Accueil",
	"/quests": "Quêtes",
	"/schools": "Écoles",
	"/leaderboard": "Classement",
	"/notifications": "Notifications",
	"/marketplace": "Marketplace",
	"/my-purchases": "Mes achats",
	"/admin/marketplace": "Marketplace",
	"/admin/analytics": "Analytics",
	"/admin/claims": "Réclamations",
	"/admin/purchases": "Historique des achats",
	"/admin/home": "Accueil",
	"/admin/quests": "Quêtes",
	"/admin/users": "Utilisateurs",
	"/admin/leaderboard": "Classement",
	"/admin/settings": "Paramètres école",
};

export const data = {
	admin: [
		{ name: "Accueil", url: "/admin/home", icon: IconHome },
		{ name: "Quêtes", url: "/admin/quests", icon: IconMapPin },
		{ name: "Utilisateurs", url: "/admin/users", icon: IconUsers },
		{ name: "Marketplace", url: "/admin/marketplace", icon: IconShoppingBag },
		{ name: "Analytics", url: "/admin/analytics", icon: IconChartBar },
		{ name: "Réclamations", url: "/admin/claims", icon: IconClipboardCheck },
		{
			name: "Historique des achats",
			url: "/admin/purchases",
			icon: IconHistory,
		},
		{ name: "Leaderboard", url: "/leaderboard", icon: IconTrophy },
		{ name: "Paramètres école", url: "/admin/settings", icon: IconSettings },
	],

	student: [
		{ name: "Accueil", url: "/home", icon: IconHome },
		{ name: "Quêtes", url: "/quests", icon: IconMapPin },
		{ name: "Marketplace", url: "/marketplace", icon: IconShoppingBag },
		{ name: "Classement", url: "/leaderboard", icon: IconTrophy },
		{ name: "Notifications", url: "/notifications", icon: IconBell },
		{ name: "Mes achats", url: "/my-purchases", icon: IconReceipt },
	],
};
