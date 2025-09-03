import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@klaz/ui";
import { IconInnerShadowTop } from "@tabler/icons-react";
import { Link, useRouterState } from "@tanstack/react-router";
import { NavUser } from "@/components/sidebar/nav-user";
import { NavWithSubmenu } from "@/components/sidebar/nav-with-submenu";
import { questsSubmenu, simpleItems } from "@/nav-routes/nav-routes";
import useAuth from "@/stores/auth-store";

export default function AppSidebar({
	...props
}: React.ComponentProps<typeof Sidebar>) {
	const { user } = useAuth();
	const routerState = useRouterState();
	const currentPath = routerState.location.pathname;

	if (!user) {
		return null;
	}

	return (
		<Sidebar collapsible="offcanvas" {...props}>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton
							asChild
							isActive={currentPath === "/home"}
							className="data-[slot=sidebar-menu-button]:!p-1.5"
						>
							<Link to="/home">
								<IconInnerShadowTop className="!size-5" />
								<span className="text-base font-semibold">
									Klaz | Super Admin
								</span>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<NavWithSubmenu
					simpleItems={simpleItems}
					questsSubmenu={questsSubmenu}
				/>
			</SidebarContent>
			<SidebarFooter>
				<NavUser user={user} />
			</SidebarFooter>
		</Sidebar>
	);
}
