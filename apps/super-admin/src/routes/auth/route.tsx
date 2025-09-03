import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { GalleryVerticalEnd } from "lucide-react";
import useAuth from "@/stores/auth-store";

export const Route = createFileRoute("/auth")({
	beforeLoad: async () => {
		const { isAuthenticated } = useAuth.getState();

		if (isAuthenticated()) {
			redirect({
				to: "/home",
			});
		}
	},
	component: AuthLayout,
});

function AuthLayout() {
	return (
		<div className="grid min-h-svh">
			<div className="flex flex-col gap-4 p-6 md:p-10">
				<div className="flex justify-center gap-2 md:justify-start">
					<a href="/" className="flex items-center gap-2 font-medium">
						<div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
							<GalleryVerticalEnd className="size-4" />
						</div>
						Klaz | Super Admin
					</a>
				</div>
				<div className="flex flex-1 items-center justify-center">
					<div className="w-full max-w-md">
						<Outlet />
					</div>
				</div>
			</div>
		</div>
	);
}
