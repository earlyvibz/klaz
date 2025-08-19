import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	formatLevel,
	formatPoints,
	getLevelProgress,
	getPointsToNextLevel,
} from "@/lib/gamification";
import type { User } from "@/types";

export default function StudentStats({ user }: { user: User }) {
	const levelProgress = getLevelProgress(user);
	const pointsToNext = getPointsToNextLevel(user);

	return (
		<div className="space-y-6">
			<div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg">
				<h1 className="text-2xl font-bold">
					Salut {user.firstName || "Étudiant"} ! 👋
				</h1>
				<p className="mt-2 opacity-90">
					Tu es {formatLevel(user.level)} avec {formatPoints(user.points)}
				</p>

				{/* Barre de progression vers le prochain niveau */}
				<div className="mt-4 space-y-2">
					<div className="flex justify-between text-sm opacity-90">
						<span>{formatLevel(user.level)}</span>
						<span>{formatLevel(user.level + 1)}</span>
					</div>
					<div className="w-full bg-white/20 rounded-full h-2">
						<div
							className="bg-white h-2 rounded-full transition-all duration-500 ease-out"
							style={{ width: `${levelProgress * 100}%` }}
						/>
					</div>
					<div className="text-sm opacity-90 text-center">
						{pointsToNext > 0
							? `${pointsToNext} points jusqu'au prochain niveau`
							: "Niveau max atteint !"}
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">🏆 Niveau</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold">{user.level}</div>
						<p className="text-sm text-muted-foreground mt-1">
							{Math.round(levelProgress * 100)}% vers le niveau {user.level + 1}
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">⭐ Points</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold">
							{user.points.toLocaleString()}
						</div>
						<p className="text-sm text-muted-foreground mt-1">
							{pointsToNext > 0
								? `${pointsToNext} pour level up`
								: "Niveau max !"}
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">👥 Groupe</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-lg">{user.group?.name || "Aucun groupe"}</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
