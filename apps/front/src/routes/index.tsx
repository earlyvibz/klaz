import { createFileRoute } from "@tanstack/react-router";
import Spinner from "@/components/spinner/spinner";

export const Route = createFileRoute("/")({
	component: IndexComponent,
});

function IndexComponent() {
	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
			<Spinner />
		</div>
	);
}
