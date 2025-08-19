import { createRootRoute, Outlet } from "@tanstack/react-router";
import AppProvider from "../providers/app-provider";

export const Route = createRootRoute({
	component: () => (
		<AppProvider>
			<Outlet />
		</AppProvider>
	),
});
