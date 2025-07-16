import {
	IconCirclePlusFilled,
	IconMapPin,
	IconSchool,
} from "@tabler/icons-react";
import { useAuth } from "@/hooks/auth/context";
import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "../ui/sidebar";

export function NavButton() {
	const { isAdmin, isSuperAdmin, isStudent } = useAuth();

	return (
		<SidebarGroup>
			<SidebarGroupContent className="flex flex-col gap-2">
				<SidebarMenu>
					<SidebarMenuItem className="flex items-center gap-2">
						{isSuperAdmin() && (
							<SidebarMenuButton
								tooltip="Quick Create"
								className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
							>
								<IconSchool />
								<span>Ajouter une école</span>
							</SidebarMenuButton>
						)}
						{isAdmin() && (
							<SidebarMenuButton
								tooltip="Quick Create"
								className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
							>
								<IconCirclePlusFilled />
								<span>Créer une quête</span>
							</SidebarMenuButton>
						)}

						{isStudent() && (
							<SidebarMenuButton
								tooltip="Quick Create"
								className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
							>
								<IconMapPin />
								<span>Participer à une quête</span>
							</SidebarMenuButton>
						)}
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	);
}
