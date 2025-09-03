import {
	Button,
	Label,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@klaz/ui";
import {
	IconChevronLeft,
	IconChevronRight,
	IconChevronsLeft,
	IconChevronsRight,
} from "@tabler/icons-react";
import type { PaginatedStudentsResponse } from "@/types";

interface PaginationProps {
	meta: PaginatedStudentsResponse["meta"];
	currentLimit: number;
	onPageChange: (page: number) => void;
	onLimitChange: (limit: number) => void;
}

export default function Pagination({
	meta,
	currentLimit,
	onPageChange,
	onLimitChange,
}: PaginationProps) {
	const canGoToPrevious = meta.currentPage > 1;
	const canGoToNext = meta.currentPage < meta.lastPage;
	const hasPages = meta.lastPage > 1;

	if (!hasPages) {
		return null;
	}

	return (
		<div className="flex items-center justify-between px-4 py-4">
			<div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
				Affichage de {(meta.currentPage - 1) * meta.perPage + 1} à{" "}
				{Math.min(meta.currentPage * meta.perPage, meta.total)} sur {meta.total}
			</div>
			<div className="flex w-full items-center gap-8 lg:w-fit">
				<div className="hidden items-center gap-2 lg:flex">
					<Label htmlFor="rows-per-page" className="text-sm font-medium">
						Par page
					</Label>
					<Select
						value={`${currentLimit}`}
						onValueChange={(value) => {
							onLimitChange(Number(value));
						}}
					>
						<SelectTrigger size="sm" className="w-20" id="rows-per-page">
							<SelectValue placeholder={currentLimit} />
						</SelectTrigger>
						<SelectContent side="top">
							{[5, 10, 25, 50, 100].map((pageSize) => (
								<SelectItem key={pageSize} value={`${pageSize}`}>
									{pageSize}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				<div className="flex w-fit items-center justify-center text-sm font-medium">
					Page {meta.currentPage} sur {meta.lastPage}
				</div>
				<div className="ml-auto flex items-center gap-2 lg:ml-0">
					<Button
						variant="outline"
						className="hidden h-8 w-8 p-0 lg:flex"
						onClick={() => onPageChange(1)}
						disabled={!canGoToPrevious}
					>
						<span className="sr-only">Aller à la première page</span>
						<IconChevronsLeft />
					</Button>
					<Button
						variant="outline"
						className="size-8"
						size="icon"
						onClick={() => onPageChange(meta.currentPage - 1)}
						disabled={!canGoToPrevious}
					>
						<span className="sr-only">Page précédente</span>
						<IconChevronLeft />
					</Button>
					<Button
						variant="outline"
						className="size-8"
						size="icon"
						onClick={() => onPageChange(meta.currentPage + 1)}
						disabled={!canGoToNext}
					>
						<span className="sr-only">Page suivante</span>
						<IconChevronRight />
					</Button>
					<Button
						variant="outline"
						className="hidden size-8 lg:flex"
						size="icon"
						onClick={() => onPageChange(meta.lastPage)}
						disabled={!canGoToNext}
					>
						<span className="sr-only">Aller à la dernière page</span>
						<IconChevronsRight />
					</Button>
				</div>
			</div>
		</div>
	);
}
