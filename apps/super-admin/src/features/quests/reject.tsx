import { Button } from "@klaz/ui";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { TuyauHTTPError } from "@tuyau/client";
import { toast } from "sonner";
import Spinner from "@/components/spinner/spinner";
import { tuyau } from "@/main";

export default function Reject({
	questSubmissionId,
}: {
	questSubmissionId: string;
}) {
	const router = useRouter();

	const { isPending, mutate } = useMutation({
		mutationFn: () =>
			tuyau.quests
				.submissions({ submissionId: questSubmissionId })
				.reject.$post()
				.unwrap(),
		onSuccess: () => {
			toast.success("Quête approuvée avec succès");
			router.invalidate();
		},
		onError: (error) => {
			toast.error("Erreur lors de l'approuver");
			if (error instanceof TuyauHTTPError) {
				// biome-ignore lint/suspicious/noExplicitAny: false positive
				toast.error((error.value as any).errors[0].message);
			}
		},
	});

	return (
		<Button
			size="sm"
			variant="destructive"
			onClick={() => mutate()}
			disabled={isPending}
		>
			{isPending ? <Spinner /> : "Rejeter"}
		</Button>
	);
}
