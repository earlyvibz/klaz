import {
	Badge,
	Button,
	Input,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@klaz/ui";
import { IconSearch, IconTrash, IconUser, IconX } from "@tabler/icons-react";
import { useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import { tuyau } from "@/main";
import type { PaginatedStudentsResponse, User } from "@/types";

interface StudentsTableProps {
	students: PaginatedStudentsResponse["students"];
	searchValue: string;
	onSearchChange: (search: string) => void;
}

export function StudentsTable({
	students,
	searchValue,
	onSearchChange,
}: StudentsTableProps) {
	const router = useRouter();
	const [detachingStudent, setDetachingStudent] = useState<string | null>(null);

	const handleDetachStudent = async (studentId: string) => {
		if (detachingStudent) return;

		if (
			!confirm(
				"Êtes-vous sûr de vouloir détacher cet étudiant de l'école ? Cette action est irréversible.",
			)
		) {
			return;
		}

		setDetachingStudent(studentId);

		try {
			const { error } = await tuyau
				.students({ id: studentId })
				.detach.$delete();

			if (error) {
				toast.error("Erreur lors du détachement de l'étudiant");
				return;
			}

			toast.success("Étudiant détaché avec succès");
			router.invalidate();
		} catch (err) {
			console.error("Error detaching student:", err);
			toast.error("Erreur lors du détachement de l'étudiant");
		} finally {
			setDetachingStudent(null);
		}
	};

	const handleClearSearch = () => {
		onSearchChange("");
	};

	return (
		<div className="space-y-4">
			{/* Search Bar */}
			<div className="flex items-center space-x-2">
				<div className="relative flex-1 max-w-sm">
					<IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
					<Input
						type="text"
						placeholder="Rechercher par nom, prénom ou email..."
						value={searchValue}
						onChange={(e) => onSearchChange(e.target.value)}
						className="pl-10 pr-10"
					/>
					{searchValue && (
						<Button
							variant="ghost"
							size="sm"
							onClick={handleClearSearch}
							className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
						>
							<IconX className="h-4 w-4" />
						</Button>
					)}
				</div>
			</div>

			{/* Table or Empty State */}
			{!students.length ? (
				<div className="text-center py-8">
					<IconUser className="mx-auto h-12 w-12 text-gray-400" />
					<h3 className="mt-2 text-sm font-medium text-gray-900">
						{searchValue ? "Aucun résultat" : "Aucun étudiant"}
					</h3>
					<p className="mt-1 text-sm text-gray-500">
						{searchValue
							? `Aucun étudiant ne correspond à "${searchValue}".`
							: "Aucun étudiant trouvé dans cette école."}
					</p>
					{searchValue && (
						<Button
							variant="outline"
							size="sm"
							onClick={handleClearSearch}
							className="mt-4"
						>
							Effacer la recherche
						</Button>
					)}
				</div>
			) : (
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Nom</TableHead>
							<TableHead>Prénom</TableHead>
							<TableHead>Email</TableHead>
							<TableHead className="text-center">Level</TableHead>
							<TableHead className="text-center">Points</TableHead>
							<TableHead className="text-center">Inscription</TableHead>
							<TableHead className="text-center">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{students.map((student: User) => (
							<TableRow key={student.id}>
								<TableCell className="font-medium">
									{student.lastName || "N/A"}
								</TableCell>
								<TableCell className="font-medium">
									{student.firstName || "N/A"}
								</TableCell>
								<TableCell>{student.email}</TableCell>
								<TableCell className="text-center">
									<Badge variant="secondary">{student.level}</Badge>
								</TableCell>
								<TableCell className="text-center font-semibold">
									{student.points}
								</TableCell>
								<TableCell className="text-center text-sm text-gray-500">
									{formatDate(student.createdAt)}
								</TableCell>
								<TableCell className="text-center">
									<Button
										variant="ghost"
										size="sm"
										onClick={() => handleDetachStudent(student.id)}
										disabled={detachingStudent === student.id}
										className="text-red-600 hover:text-red-700 hover:bg-red-50 disabled:opacity-50"
									>
										<IconTrash className="h-4 w-4" />
									</Button>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			)}
		</div>
	);
}
