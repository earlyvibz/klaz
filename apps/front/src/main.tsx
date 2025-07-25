import { api } from "@klaz/backend/api";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { createTuyau } from "@tuyau/client";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import reportWebVitals from "./reportWebVitals.ts";
import { routeTree } from "./routeTree.gen";
import "./styles.css";
import { AuthProvider, useAuth } from "@/hooks/auth";
import { TenantProvider, useTenant } from "@/hooks/tenant";
import Spinner from "./components/spinner/spinner.tsx";

export const tuyau = createTuyau({
	api,
	baseUrl: import.meta.env.VITE_API_URL,
	hooks: {
		beforeRequest: [
			(request) => {
				const token = localStorage.getItem("auth-token");
				if (token) {
					request.headers.set("Authorization", `Bearer ${token}`);
				}
			},
		],
	},
});

// Create a new router instance
const router = createRouter({
	routeTree,
	context: {
		// biome-ignore lint/style/noNonNullAssertion: from tanstack router
		auth: undefined!,
		// biome-ignore lint/style/noNonNullAssertion: from tanstack router
		tenant: undefined!,
	},
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

function InnerApp() {
	const auth = useAuth();
	const tenant = useTenant();

	// Show loading state while auth or tenant is being resolved
	if (auth.loading || tenant.isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="flex flex-col items-center justify-center">
					<Spinner />
					<p className="mt-4 text-gray-600">Chargement...</p>
				</div>
			</div>
		);
	}

	return <RouterProvider router={router} context={{ auth, tenant }} />;
}

// Render the app
const rootElement = document.getElementById("app");
if (rootElement && !rootElement.innerHTML) {
	const root = ReactDOM.createRoot(rootElement);
	root.render(
		<StrictMode>
			<AuthProvider>
				<TenantProvider>
					<InnerApp />
				</TenantProvider>
			</AuthProvider>
		</StrictMode>,
	);
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
