import { CheckCircle, Clock, Target, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export type QuestFilter =
	| "all"
	| "available"
	| "pending"
	| "completed"
	| "rejected"
	| "expired";

interface QuestFiltersProps {
	activeFilter: QuestFilter;
	onFilterChange: (filter: QuestFilter) => void;
}

export default function QuestFilters({
	activeFilter,
	onFilterChange,
}: QuestFiltersProps) {
	const filters = [
		{
			key: "all" as QuestFilter,
			label: "Toutes",
			icon: null,
			color:
				"bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700",
		},
		{
			key: "available" as QuestFilter,
			label: "Disponibles",
			icon: <Target className="w-4 h-4" />,
			color:
				"bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50",
		},
		{
			key: "pending" as QuestFilter,
			label: "En validation",
			icon: <Clock className="w-4 h-4" />,
			color:
				"bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:hover:bg-orange-900/50",
		},
		{
			key: "completed" as QuestFilter,
			label: "Terminées",
			icon: <CheckCircle className="w-4 h-4" />,
			color:
				"bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-900/50",
		},
		{
			key: "rejected" as QuestFilter,
			label: "Refusées",
			icon: <X className="w-4 h-4" />,
			color:
				"bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50",
		},
		{
			key: "expired" as QuestFilter,
			label: "Expirées",
			icon: <Clock className="w-4 h-4" />,
			color:
				"bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700",
		},
	];

	return (
		<div className="flex flex-wrap gap-2">
			{filters.map((filter) => (
				<Button
					key={filter.key}
					variant="ghost"
					size="sm"
					onClick={() => onFilterChange(filter.key)}
					className={`flex items-center gap-2 h-8 px-3 rounded-full transition-all ${
						activeFilter === filter.key
							? `ring-2 ring-primary/20 shadow-sm ${filter.color}`
							: filter.color
					}`}
				>
					{filter.icon}
					<span className="text-sm font-medium">{filter.label}</span>
				</Button>
			))}
		</div>
	);
}
