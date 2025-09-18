import type { User } from "@/types";

export function calculateLevel(exp: number): number {
	return Math.floor(Math.sqrt(exp / 100)) + 1;
}

export function getExpForNextLevel(level: number): number {
	const nextLevel = level + 1;
	return (nextLevel - 1) ** 2 * 100;
}

export function getExpForCurrentLevel(level: number): number {
	if (level <= 1) return 0;
	return (level - 1) ** 2 * 100;
}

export function getLevelProgress(user: User): number {
	const currentLevelExp = getExpForCurrentLevel(user.level);
	const nextLevelExp = getExpForNextLevel(user.level);
	if (nextLevelExp === currentLevelExp) return 1;
	const progress =
		(user.exp - currentLevelExp) / (nextLevelExp - currentLevelExp);
	return Math.max(0, Math.min(1, progress));
}

export function getExpToNextLevel(user: User): number {
	const nextLevelExp = getExpForNextLevel(user.level);
	return Math.max(0, nextLevelExp - user.exp);
}

export function getCurrentBadge(user: User) {
	// Get the highest level badge the user has earned
	const levelBadges = user.userBadges
		?.filter(
			(ub) => ub.badge?.requiredLevel && ub.badge.requiredLevel <= user.level,
		)
		.sort(
			(a, b) => (b.badge?.requiredLevel || 0) - (a.badge?.requiredLevel || 0),
		);

	return levelBadges?.[0]?.badge || null;
}

export function getCurrentBadgeTitle(user: User): string {
	const currentBadge = getCurrentBadge(user);
	return currentBadge?.name || user.currentBadgeTitle || "Étudiant";
}

export function formatLevel(level: number): string {
	return `Niveau ${level}`;
}

export function formatPoints(points: number): string {
	return `${points.toLocaleString()} points`;
}
