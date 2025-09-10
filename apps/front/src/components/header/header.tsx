import { Separator, SidebarTrigger } from "@klaz/ui";
import { useLocation } from "@tanstack/react-router";
import { pageTitles } from "@/nav-routes/nav-routes";
import useAuth from "@/stores/auth-store";
import NotificationsPanel from "./notifications-panel";

export default function Header() {
	const location = useLocation();
	const pageTitle = pageTitles[location.pathname] || "Klaz";
	const { user } = useAuth();

	return (
		<header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
			<div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
				<SidebarTrigger className="-ml-1" />
				<Separator
					orientation="vertical"
					className="mx-2 data-[orientation=vertical]:h-4"
				/>
				<h1 className="text-base font-medium">{pageTitle}</h1>
			</div>
			<div className="flex items-center gap-2 px-4">
				{user?.role === "STUDENT" && <NotificationsPanel />}
			</div>
		</header>
	);
}
