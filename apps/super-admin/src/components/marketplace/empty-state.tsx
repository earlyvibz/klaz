import { Card, CardContent } from "@klaz/ui";
import { IconShoppingBag } from "@tabler/icons-react";

export default function EmptyState() {
	return (
		<Card>
			<CardContent className="p-12 text-center">
				<IconShoppingBag className="mx-auto h-12 w-12 text-gray-400 mb-4" />
				<h3 className="text-lg font-medium text-gray-900 mb-2">
					Sélectionnez une école
				</h3>
				<p className="text-gray-500">
					Choisissez une école dans la liste ci-dessus pour voir et gérer ses
					produits marketplace.
				</p>
			</CardContent>
		</Card>
	);
}
