import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@klaz/ui";
import type { Icon } from "@tabler/icons-react";
import { Link, useRouterState } from "@tanstack/react-router";

export function NavAdmin({
	items,
}: {
	items: {
		name: string;
		url: string;
		icon: Icon;
	}[];
}) {
	const routerState = useRouterState();
	const currentPath = routerState.location.pathname;

	return (
		<SidebarGroup className="group-data-[collapsible=icon]:hidden">
			<SidebarGroupLabel>Admin</SidebarGroupLabel>
			<SidebarMenu>
				{items.map((item) => {
					const isActive = currentPath === item.url;
					return (
						<SidebarMenuItem key={item.name}>
							<SidebarMenuButton asChild isActive={isActive}>
								<Link to={item.url}>
									<item.icon />
									<span>{item.name}</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
					);
				})}
			</SidebarMenu>
		</SidebarGroup>
	);
}
