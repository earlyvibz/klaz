import { IconInnerShadowTop } from "@tabler/icons-react";
import { NavAdmin } from "@/components/sidebar/nav-admin";
import { NavSuperAdmin } from "@/components/sidebar/nav-super-admin";
import { NavUser } from "@/components/sidebar/nav-user";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/auth/context";
import { data } from "@/nav-routes/nav-routes";
import { NavButton } from "./nav-button";

export default function AppSidebar({
	...props
}: React.ComponentProps<typeof Sidebar>) {
	const { user, isAdmin, isSuperAdmin } = useAuth();

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
							className="data-[slot=sidebar-menu-button]:!p-1.5"
						>
							<a href="/">
								<IconInnerShadowTop className="!size-5" />
								<span className="text-base font-semibold">Klaz</span>
							</a>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<NavButton />
				{isSuperAdmin() && <NavSuperAdmin items={data.superAdmin} />}
				{isAdmin() && <NavAdmin items={data.admin} />}
			</SidebarContent>
			<SidebarFooter>
				<NavUser user={user} />
			</SidebarFooter>
		</Sidebar>
	);
}
