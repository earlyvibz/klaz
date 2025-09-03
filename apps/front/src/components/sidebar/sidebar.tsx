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
import { NavAdmin } from "@/components/sidebar/nav-admin";
import { NavUser } from "@/components/sidebar/nav-user";
import { data } from "@/nav-routes/nav-routes";
import useAuth from "@/stores/auth-store";
import useSchool from "@/stores/school-store";
import { NavButton } from "./nav-button";
import { NavStudent } from "./nav-student";

export default function AppSidebar({
	...props
}: React.ComponentProps<typeof Sidebar>) {
	const { user } = useAuth();
	const routerState = useRouterState();
	const currentPath = routerState.location.pathname;
	const { school } = useSchool();

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
									Klaz | {school?.name}
								</span>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<NavButton />
				{user.isAdmin && <NavAdmin items={data.admin} />}
				{user.isStudent && <NavStudent items={data.student} />}
			</SidebarContent>
			<SidebarFooter>
				<NavUser user={user} />
			</SidebarFooter>
		</Sidebar>
	);
}
