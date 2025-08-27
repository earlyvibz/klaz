import { IconCirclePlusFilled, IconMapPin } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import useAuth from "@/stores/auth-store";
import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "../ui/sidebar";

export function NavButton() {
	const { user } = useAuth();
	if (!user) {
		return null;
	}

	return (
		<SidebarGroup>
			<SidebarGroupContent className="flex flex-col gap-2">
				<SidebarMenu>
					<SidebarMenuItem className="flex items-center gap-2">
						{user.isAdmin && (
							<SidebarMenuButton
								tooltip="Quick Create"
								className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
							>
								<IconCirclePlusFilled />
								<span>Créer une quête</span>
							</SidebarMenuButton>
						)}

						{user.isStudent && (
							<Link to="/quests" className="w-full">
								<SidebarMenuButton
									tooltip="Quick Create"
									className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
								>
									<IconMapPin />
									<span>Participer à une quête</span>
								</SidebarMenuButton>
							</Link>
						)}
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	);
}
