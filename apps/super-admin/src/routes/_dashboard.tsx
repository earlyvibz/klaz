import { SidebarInset, SidebarProvider } from "@klaz/ui";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import Header from "@/components/header/header";
import AppSidebar from "@/components/sidebar/sidebar";
import useAuth from "@/stores/auth-store";

export const Route = createFileRoute("/_dashboard")({
	beforeLoad: async () => {
		const { checkAuth } = useAuth.getState();
		const isAuthenticated = await checkAuth();

		if (!isAuthenticated) {
			throw redirect({ to: "/auth/login" });
		}
	},
	component: DashboardLayout,
});

function DashboardLayout() {
	return (
		<SidebarProvider
			style={
				{
					"--sidebar-width": "calc(var(--spacing) * 72)",
					"--header-height": "calc(var(--spacing) * 12)",
				} as React.CSSProperties
			}
		>
			<AppSidebar variant="inset" />
			<SidebarInset>
				<Header />
				<div className="flex flex-1 flex-col">
					<div className="@container/main flex flex-1 flex-col gap-2">
						<div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
							<div className="px-4">
								<Outlet />
							</div>
						</div>
					</div>
				</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
