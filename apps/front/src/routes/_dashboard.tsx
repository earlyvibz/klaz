import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import Header from "@/components/header/header";
import AppSidebar from "@/components/sidebar/sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export const Route = createFileRoute("/_dashboard")({
	beforeLoad: ({ context, location }) => {
		if (context.auth.loading) {
			return
		}

		if (!context.auth.isAuthenticated) {
			throw redirect({
				to: "/auth/login",
				search: {
					redirect: location.href,
				},
			})
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
	)
}
