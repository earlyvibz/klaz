import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import type { Student } from "@/types/student";

export default function TableUsers({ users }: { users: Student[] }) {
	return (
		<Table>
			<TableHeader className="bg-muted sticky top-0 z-10">
				<TableRow>
					<TableHead>Nom</TableHead>
					<TableHead>Prénom</TableHead>
					<TableHead>Email</TableHead>
					<TableHead>Level</TableHead>
					<TableHead>Points</TableHead>
					<TableHead>Actions</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{users.length > 0 ? (
					users.map((user) => (
						<TableRow key={user.id}>
							<TableCell className="font-medium">
								{user.lastName || "N/A"}
							</TableCell>
							<TableCell className="font-medium">
								{user.firstName || "N/A"}
							</TableCell>
							<TableCell>{user.email}</TableCell>
							<TableCell>{user.level}</TableCell>
							<TableCell className="font-medium">{user.points}</TableCell>
							<TableCell>
								<div className="flex gap-2">
									<button
										type="button"
										className="text-blue-600 hover:text-blue-800 text-sm"
									>
										Voir
									</button>
									<button
										type="button"
										className="text-red-600 hover:text-red-800 text-sm"
									>
										Supprimer
									</button>
								</div>
							</TableCell>
						</TableRow>
					))
				) : (
					<TableRow>
						<TableCell colSpan={7} className="text-center py-8 text-gray-500">
							Aucun utilisateur trouvé
						</TableCell>
					</TableRow>
				)}
			</TableBody>
		</Table>
	);
}
