import { Button } from "@klaz/ui";
import { useRouter } from "@tanstack/react-router";
import { TuyauHTTPError } from "@tuyau/client";
import { toast } from "sonner";
import { tuyau } from "@/main";

export default function Reject({
	questSubmissionId,
}: {
	questSubmissionId: string;
}) {
	const router = useRouter();
	const handleReject = async () => {
		const { error } = await tuyau.quests
			.submissions({ submissionId: questSubmissionId })
			.reject.$post();

		if (error instanceof TuyauHTTPError) {
			// biome-ignore lint/suspicious/noExplicitAny: false positive
			toast.error((error.value as any).errors[0].message);
		}

		toast.success("Quête rejetée avec succès");
		router.invalidate();
	};

	return (
		<Button size="sm" variant="destructive" onClick={handleReject}>
			Rejeter
		</Button>
	);
}
