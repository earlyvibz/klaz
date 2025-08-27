import type { User } from "@/types";

export function calculateLevel(points: number): number {
	return Math.floor(Math.sqrt(points / 100)) + 1;
}

export function getPointsForNextLevel(level: number): number {
	const nextLevel = level + 1;
	return (nextLevel - 1) ** 2 * 100;
}

export function getPointsForCurrentLevel(level: number): number {
	if (level <= 1) return 0;
	return (level - 1) ** 2 * 100;
}

export function getLevelProgress(user: User): number {
	const currentLevelPoints = getPointsForCurrentLevel(user.level);
	const nextLevelPoints = getPointsForNextLevel(user.level);
	if (nextLevelPoints === currentLevelPoints) return 1;
	const progress =
		(user.points - currentLevelPoints) / (nextLevelPoints - currentLevelPoints);
	return Math.max(0, Math.min(1, progress));
}

export function getPointsToNextLevel(user: User): number {
	const nextLevelPoints = getPointsForNextLevel(user.level);
	return Math.max(0, nextLevelPoints - user.points);
}

export function formatLevel(level: number): string {
	return `Niveau ${level}`;
}

export function formatPoints(points: number): string {
	return `${points.toLocaleString()} points`;
}
