import {
	Badge,
	Button,
	Input,
	Label,
	Popover,
	PopoverContent,
	PopoverTrigger,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@klaz/ui";
import { Filter, X } from "lucide-react";
import { useState } from "react";

export interface QuestFilters {
	search?: string;
	school?: string;
	quest?: string;
	dateFrom?: string;
	dateTo?: string;
	adminId?: string; // For reviewed tables
	hasComment?: boolean; // For reviewed tables
	olderThan?: string; // For pending table
	pointsMin?: number;
	pointsMax?: number;
}

interface QuestFiltersProps {
	filters: QuestFilters;
	onFiltersChange: (filters: QuestFilters) => void;
	schools: Array<{ id: string; name: string }>;
	quests: Array<{ id: string; title: string }>;
	admins?: Array<{ id: string; name: string }>; // For reviewed tables
	showPendingFilters?: boolean; // Show filters specific to pending
	showReviewedFilters?: boolean; // Show filters specific to reviewed
}

export function QuestFiltersComponent({
	filters,
	onFiltersChange,
	schools,
	quests,
	admins = [],
	showPendingFilters = false,
	showReviewedFilters = false,
}: QuestFiltersProps) {
	const [isOpen, setIsOpen] = useState(false);

	// biome-ignore lint/suspicious/noExplicitAny: false positive
	const updateFilter = (key: keyof QuestFilters, value: any) => {
		onFiltersChange({
			...filters,
			[key]: value || undefined,
		});
	};

	const clearFilters = () => {
		onFiltersChange({});
	};

	const activeFiltersCount = Object.values(filters).filter(Boolean).length;

	const getDatePreset = (preset: string) => {
		const now = new Date();
		const dates: Record<string, Date> = {
			today: new Date(now.setHours(0, 0, 0, 0)),
			yesterday: new Date(now.setDate(now.getDate() - 1)),
			week: new Date(now.setDate(now.getDate() - 7)),
			month: new Date(now.setMonth(now.getMonth() - 1)),
		};
		return dates[preset]?.toISOString().split("T")[0];
	};

	return (
		<div className="flex items-center gap-4 mb-4">
			{/* Quick search */}
			<div className="flex-1 max-w-sm">
				<Input
					placeholder="Rechercher un étudiant..."
					value={filters.search || ""}
					onChange={(e) => updateFilter("search", e.target.value)}
					className="h-9"
				/>
			</div>

			{/* School filter */}
			<Select
				value={filters.school || "all"}
				onValueChange={(value) =>
					updateFilter("school", value === "all" ? undefined : value)
				}
			>
				<SelectTrigger className="w-48">
					<SelectValue placeholder="Toutes les écoles" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="all">Toutes les écoles</SelectItem>
					{schools.map((school) => (
						<SelectItem key={school.id} value={school.id}>
							{school.name}
						</SelectItem>
					))}
				</SelectContent>
			</Select>

			{/* Advanced filters */}
			<Popover open={isOpen} onOpenChange={setIsOpen}>
				<PopoverTrigger asChild>
					<Button variant="outline" className="h-9 relative">
						<Filter className="h-4 w-4 mr-2" />
						Filtres
						{activeFiltersCount > 0 && (
							<Badge variant="secondary" className="ml-2 h-5 text-xs">
								{activeFiltersCount}
							</Badge>
						)}
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-80" align="end">
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<h4 className="font-medium">Filtres avancés</h4>
							{activeFiltersCount > 0 && (
								<Button variant="ghost" size="sm" onClick={clearFilters}>
									<X className="h-4 w-4 mr-1" />
									Effacer
								</Button>
							)}
						</div>

						{/* Quest filter */}
						<div className="space-y-2">
							<Label htmlFor="quest-filter">Quête</Label>
							<Select
								value={filters.quest || "all"}
								onValueChange={(value) =>
									updateFilter("quest", value === "all" ? undefined : value)
								}
							>
								<SelectTrigger>
									<SelectValue placeholder="Toutes les quêtes" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">Toutes les quêtes</SelectItem>
									{quests.map((quest) => (
										<SelectItem key={quest.id} value={quest.id}>
											{quest.title}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						{/* Date presets */}
						<div className="space-y-2">
							<Label>Période</Label>
							<div className="grid grid-cols-2 gap-2">
								<Button
									variant="outline"
									size="sm"
									onClick={() =>
										updateFilter("dateFrom", getDatePreset("today"))
									}
								>
									Aujourd'hui
								</Button>
								<Button
									variant="outline"
									size="sm"
									onClick={() =>
										updateFilter("dateFrom", getDatePreset("week"))
									}
								>
									7 derniers jours
								</Button>
								<Button
									variant="outline"
									size="sm"
									onClick={() =>
										updateFilter("dateFrom", getDatePreset("month"))
									}
								>
									30 derniers jours
								</Button>
								<Button
									variant="outline"
									size="sm"
									onClick={() => {
										updateFilter("dateFrom", "");
										updateFilter("dateTo", "");
									}}
								>
									Toutes
								</Button>
							</div>
						</div>

						{/* Custom date range */}
						<div className="grid grid-cols-2 gap-2">
							<div className="space-y-1">
								<Label htmlFor="date-from">Du</Label>
								<Input
									id="date-from"
									type="date"
									value={filters.dateFrom || ""}
									onChange={(e) => updateFilter("dateFrom", e.target.value)}
								/>
							</div>
							<div className="space-y-1">
								<Label htmlFor="date-to">Au</Label>
								<Input
									id="date-to"
									type="date"
									value={filters.dateTo || ""}
									onChange={(e) => updateFilter("dateTo", e.target.value)}
								/>
							</div>
						</div>

						{/* Points range */}
						<div className="space-y-2">
							<Label>Points</Label>
							<div className="grid grid-cols-2 gap-2">
								<div>
									<Input
										type="number"
										placeholder="Min"
										value={filters.pointsMin || ""}
										onChange={(e) =>
											updateFilter(
												"pointsMin",
												e.target.value ? Number(e.target.value) : undefined,
											)
										}
									/>
								</div>
								<div>
									<Input
										type="number"
										placeholder="Max"
										value={filters.pointsMax || ""}
										onChange={(e) =>
											updateFilter(
												"pointsMax",
												e.target.value ? Number(e.target.value) : undefined,
											)
										}
									/>
								</div>
							</div>
						</div>

						{/* Pending-specific filters */}
						{showPendingFilters && (
							<div className="space-y-2">
								<Label>Ancienneté</Label>
								<Select
									value={filters.olderThan || "all"}
									onValueChange={(value) =>
										updateFilter(
											"olderThan",
											value === "all" ? undefined : value,
										)
									}
								>
									<SelectTrigger>
										<SelectValue placeholder="Toutes" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">Toutes</SelectItem>
										<SelectItem value="1">Plus de 24h</SelectItem>
										<SelectItem value="3">Plus de 3 jours</SelectItem>
										<SelectItem value="7">Plus de 7 jours</SelectItem>
									</SelectContent>
								</Select>
							</div>
						)}

						{/* Reviewed-specific filters */}
						{showReviewedFilters && (
							<>
								{/* Admin filter */}
								{admins.length > 0 && (
									<div className="space-y-2">
										<Label>Administrateur</Label>
										<Select
											value={filters.adminId || "all"}
											onValueChange={(value) =>
												updateFilter(
													"adminId",
													value === "all" ? undefined : value,
												)
											}
										>
											<SelectTrigger>
												<SelectValue placeholder="Tous" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="all">Tous</SelectItem>
												{admins.map((admin) => (
													<SelectItem key={admin.id} value={admin.id}>
														{admin.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
								)}

								{/* Comment filter */}
								<div className="space-y-2">
									<Label>Commentaires</Label>
									<Select
										value={
											filters.hasComment === undefined
												? "all"
												: filters.hasComment.toString()
										}
										onValueChange={(value) =>
											updateFilter(
												"hasComment",
												value === "all" ? undefined : value === "true",
											)
										}
									>
										<SelectTrigger>
											<SelectValue placeholder="Tous" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="all">Tous</SelectItem>
											<SelectItem value="true">Avec commentaire</SelectItem>
											<SelectItem value="false">Sans commentaire</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</>
						)}
					</div>
				</PopoverContent>
			</Popover>

			{/* Active filters display */}
			{activeFiltersCount > 0 && (
				<div className="flex items-center gap-2">
					{filters.school && (
						<Badge variant="secondary" className="gap-1">
							École: {schools.find((s) => s.id === filters.school)?.name}
							<X
								className="h-3 w-3 cursor-pointer"
								onClick={() => updateFilter("school", "")}
							/>
						</Badge>
					)}
					{filters.quest && (
						<Badge variant="secondary" className="gap-1">
							Quête: {quests.find((q) => q.id === filters.quest)?.title}
							<X
								className="h-3 w-3 cursor-pointer"
								onClick={() => updateFilter("quest", "")}
							/>
						</Badge>
					)}
					{filters.search && (
						<Badge variant="secondary" className="gap-1">
							"{filters.search}"
							<X
								className="h-3 w-3 cursor-pointer"
								onClick={() => updateFilter("search", "")}
							/>
						</Badge>
					)}
				</div>
			)}
		</div>
	);
}
