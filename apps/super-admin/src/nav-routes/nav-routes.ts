import {
	IconCheck,
	IconClock,
	IconHome,
	IconMapPin,
	IconSchool,
	IconUsers,
	IconX,
} from "@tabler/icons-react";

export const pageTitles: Record<string, string> = {
	"/users": "Utilisateurs",
	"/home": "Accueil",
	"/quests": "Quêtes",
	"/quests/pending": "Quêtes en attente",
	"/quests/rejected": "Quêtes rejetées",
	"/quests/approved": "Quêtes validées",
	"/schools": "Écoles",
	"/leaderboard": "Classement",
};

export const simpleItems = [
	// { name: "Accueil", url: "/home", icon: IconHome },
	// { name: "Utilisateurs", url: "/users", icon: IconUsers },
	// { name: "Écoles", url: "/schools", icon: IconSchool },
];

export const questsSubmenu = {
	title: "Quêtes",
	icon: IconMapPin,
	url: "/quests",
	items: [
		{ title: "En attente", url: "/quests/pending", icon: IconClock },
		{ title: "Rejetées", url: "/quests/rejected", icon: IconX },
		{ title: "Validées", url: "/quests/approved", icon: IconCheck },
	],
};

export const data = [
	{ name: "Accueil", url: "/home", icon: IconHome },
	{ name: "Quêtes", url: "/quests", icon: IconMapPin },
	{ name: "Utilisateurs", url: "/users", icon: IconUsers },
	{ name: "Écoles", url: "/schools", icon: IconSchool },
];
