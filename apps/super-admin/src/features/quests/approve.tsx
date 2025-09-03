import { Button } from "@klaz/ui";
import { useRouter } from "@tanstack/react-router";
import { TuyauHTTPError } from "@tuyau/client";
import { toast } from "sonner";
import { tuyau } from "@/main";

export default function Approve({
	questSubmissionId,
}: {
	questSubmissionId: string;
}) {
	const router = useRouter();
	const handleApprove = async () => {
		const { error } = await tuyau.quests
			.submissions({ submissionId: questSubmissionId })
			.approve.$post();

		if (error instanceof TuyauHTTPError) {
			// biome-ignore lint/suspicious/noExplicitAny: false positive
			toast.error((error.value as any).errors[0].message);
		}

		toast.success("Quête approuvée avec succès");
		router.invalidate();
	};

	return (
		<Button size="sm" variant="default" onClick={handleApprove}>
			Approuver
		</Button>
	);
}
