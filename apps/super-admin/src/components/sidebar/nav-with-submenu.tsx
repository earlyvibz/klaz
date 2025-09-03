import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
} from "@klaz/ui";
import type { Icon } from "@tabler/icons-react";
import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

export function NavWithSubmenu({
	simpleItems,
	questsSubmenu,
}: {
	simpleItems: {
		name: string;
		url: string;
		icon: Icon;
	}[];
	questsSubmenu: {
		title: string;
		icon: Icon;
		url: string;
		items: {
			title: string;
			url: string;
			icon: Icon;
		}[];
	};
}) {
	const routerState = useRouterState();
	const currentPath = routerState.location.pathname;

	const isQuestsActive = currentPath.startsWith("/quests");

	return (
		<SidebarGroup className="group-data-[collapsible=icon]:hidden">
			<SidebarGroupLabel>Admin</SidebarGroupLabel>
			<SidebarMenu>
				{simpleItems.map((item) => {
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

				<Collapsible
					asChild
					defaultOpen={isQuestsActive}
					className="group/collapsible"
				>
					<SidebarMenuItem>
						<CollapsibleTrigger asChild>
							<SidebarMenuButton
								tooltip={questsSubmenu.title}
								isActive={isQuestsActive}
							>
								<questsSubmenu.icon />
								<span>{questsSubmenu.title}</span>
								<ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
							</SidebarMenuButton>
						</CollapsibleTrigger>
						<CollapsibleContent>
							<SidebarMenuSub>
								{questsSubmenu.items.map((subItem) => {
									const isSubActive = currentPath === subItem.url;
									return (
										<SidebarMenuSubItem key={subItem.title}>
											<SidebarMenuSubButton asChild isActive={isSubActive}>
												<Link to={subItem.url}>
													<subItem.icon />
													<span>{subItem.title}</span>
												</Link>
											</SidebarMenuSubButton>
										</SidebarMenuSubItem>
									);
								})}
							</SidebarMenuSub>
						</CollapsibleContent>
					</SidebarMenuItem>
				</Collapsible>
			</SidebarMenu>
		</SidebarGroup>
	);
}
