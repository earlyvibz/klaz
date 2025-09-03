import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	Label,
} from "@klaz/ui";
import type { User } from "../../types";

interface UserInfoCardProps {
	user: User;
}

export function UserInfoCard({ user }: UserInfoCardProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Informations personnelles</CardTitle>
				<CardDescription>
					Vos informations de base et statistiques
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="grid grid-cols-2 gap-4">
					<div>
						<Label className="text-sm font-medium text-muted-foreground">
							Prénom
						</Label>
						<p className="text-sm">{user.firstName || "Non renseigné"}</p>
					</div>
					<div>
						<Label className="text-sm font-medium text-muted-foreground">
							Nom
						</Label>
						<p className="text-sm">{user.lastName || "Non renseigné"}</p>
					</div>
				</div>
				<div>
					<Label className="text-sm font-medium text-muted-foreground">
						Email
					</Label>
					<p className="text-sm">{user.email}</p>
				</div>
				<div className="grid grid-cols-2 gap-4">
					<div>
						<Label className="text-sm font-medium text-muted-foreground">
							Rôle
						</Label>
						<p className="text-sm">{user.role}</p>
					</div>
					<div>
						<Label className="text-sm font-medium text-muted-foreground">
							Niveau
						</Label>
						<p className="text-sm">Niveau {user.level}</p>
					</div>
				</div>
				<div>
					<Label className="text-sm font-medium text-muted-foreground">
						Points
					</Label>
					<p className="text-sm">{user.points} points</p>
				</div>
				{user.school && (
					<div>
						<Label className="text-sm font-medium text-muted-foreground">
							École
						</Label>
						<p className="text-sm">{user.school.name}</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
