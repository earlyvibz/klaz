import { Card, CardContent, CardHeader, CardTitle } from "@klaz/ui";
import type { StudentsCountResponse } from "@/types";

export default function Stats({
	studentsCount,
}: {
	studentsCount: StudentsCountResponse;
}) {
	return (
		<div>
			<Card>
				<CardHeader>
					<CardTitle>Nombre d'étudiants</CardTitle>
				</CardHeader>
				<CardContent>
					<p>{studentsCount.count}</p>
				</CardContent>
			</Card>
		</div>
	);
}
