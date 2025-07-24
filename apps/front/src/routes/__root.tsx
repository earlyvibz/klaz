import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { TenantDevTools } from "@/components/tenant";
import type { AuthContext } from "@/hooks/auth";
import type { TenantContext } from "@/hooks/tenant";

interface MyRouterContext {
	auth: AuthContext;
	tenant: TenantContext;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
	component: () => (
		<>
			<Outlet />
			<TanStackRouterDevtools />
			<TenantDevTools />
		</>
	),
});
