import {
	Button,
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@klaz/ui";
import { Eye } from "lucide-react";
import { useState } from "react";

interface ProofViewerProps {
	proofUrl: string;
	questTitle?: string;
	studentName?: string;
}

export function ProofViewer({
	proofUrl,
	questTitle,
	studentName,
}: ProofViewerProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [imageLoaded, setImageLoaded] = useState(false);

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button variant="outline" size="sm" className="gap-2">
					<Eye className="h-4 w-4" />
					Voir
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
				<DialogHeader>
					<DialogTitle className="text-left">
						Preuve de quête
						{questTitle && (
							<span className="text-muted-foreground font-normal">
								{" "}
								- {questTitle}
							</span>
						)}
						{studentName && (
							<div className="text-sm text-muted-foreground font-normal mt-1">
								Soumis par {studentName}
							</div>
						)}
					</DialogTitle>
				</DialogHeader>

				<div className="flex flex-col items-center justify-center space-y-4 max-h-[calc(90vh-120px)]">
					{!imageLoaded && (
						<div className="flex items-center justify-center h-64 w-full bg-muted rounded-lg">
							<div className="flex flex-col items-center gap-2">
								<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
								<span className="text-sm text-muted-foreground">
									Chargement...
								</span>
							</div>
						</div>
					)}

					<img
						src={proofUrl}
						alt="Preuve de quête"
						className={`max-w-full max-h-full object-contain rounded-lg shadow-lg ${
							!imageLoaded ? "hidden" : ""
						}`}
						onLoad={() => setImageLoaded(true)}
						onError={() => {
							setImageLoaded(true);
						}}
					/>

					<div className="flex gap-2 pt-4">
						<Button variant="outline" size="sm" asChild>
							<a
								href={proofUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="gap-2"
							>
								📎 Ouvrir dans un nouvel onglet
							</a>
						</Button>
						<Button variant="outline" size="sm" asChild>
							<a href={proofUrl} download className="gap-2">
								💾 Télécharger
							</a>
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
