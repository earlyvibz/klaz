import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@klaz/ui";
import type { School } from "@/types";

interface SchoolSelectorProps {
	schools: School[];
	selectedSchoolId: string;
	onSchoolChange: (schoolId: string) => void;
}

export default function SchoolSelector({
	schools,
	selectedSchoolId,
	onSchoolChange,
}: SchoolSelectorProps) {
	return (
		<Card className="mb-6">
			<CardHeader>
				<CardTitle>Sélectionner une école</CardTitle>
			</CardHeader>
			<CardContent>
				<Select value={selectedSchoolId} onValueChange={onSchoolChange}>
					<SelectTrigger className="w-full">
						<SelectValue placeholder="Choisir une école..." />
					</SelectTrigger>
					<SelectContent>
						{schools.map((school: School) => (
							<SelectItem key={school.id} value={school.id}>
								{school.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</CardContent>
		</Card>
	);
}
