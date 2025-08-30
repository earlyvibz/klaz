import { Pencil } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Quest } from "@/types";
import QuestCreationModal from "./quest-creation-modal";

export default function UpdateQuest({ quest }: { quest: Quest }) {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<>
			<div>
				<Button variant="outline" onClick={() => setIsOpen(true)}>
					<Pencil className="w-4 h-4" />
					Modifier
				</Button>
			</div>

			<QuestCreationModal
				open={isOpen}
				onOpenChange={setIsOpen}
				quest={quest}
			/>
		</>
	);
}
