import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import type { PaginatedStudentsResponse } from "@/types";

export default function TableUsers({
	users,
}: {
	users: PaginatedStudentsResponse["students"];
}) {
	return (
		<Table className="text-center">
			<TableHeader className="bg-muted sticky top-0 z-10">
				<TableRow>
					<TableHead className="text-center">Nom</TableHead>
					<TableHead className="text-center">Prénom</TableHead>
					<TableHead className="text-center">Email</TableHead>
					<TableHead className="text-center">Level</TableHead>
					<TableHead className="text-center">Points</TableHead>
					<TableHead className="text-center">Actions</TableHead>
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
								<div className="flex gap-2 justify-center">
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
