import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function formatDate(dateString: string | Date | null): string {
	if (!dateString) return "";
	const date =
		typeof dateString === "string" ? new Date(dateString) : dateString;
	return date.toLocaleDateString("fr-FR", {
		day: "numeric",
		month: "short",
		year: "numeric",
	});
}

export const LinkifiedText = ({
	text,
}: {
	text: string | null | undefined;
}) => {
	if (!text) return null;

	const urlRegex = /(https?:\/\/[^\s]+)/g;
	const parts = text.split(urlRegex);

	return (
		<>
			{parts.map((part) => {
				if (part.match(urlRegex)) {
					return (
						<a
							key={part}
							href={part}
							className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
						>
							{part}
						</a>
					);
				}
				return <span key={part}>{part}</span>;
			})}
		</>
	);
};
