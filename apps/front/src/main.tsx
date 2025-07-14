import { api } from "@klaz/backend/api";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { createTuyau } from "@tuyau/client";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import reportWebVitals from "./reportWebVitals.ts";
import { routeTree } from "./routeTree.gen";
import "./styles.css";
import { AuthProvider, useAuth } from "@/hooks/auth";
import Spinner from "./components/spinner/spinner.tsx";

export const tuyau = createTuyau({
	api,
	baseUrl: "http://localhost:3333",
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

	// Show loading state while auth is being resolved
	if (auth.loading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="flex flex-col items-center justify-center">
					<Spinner />
					<p className="mt-4 text-gray-600">Chargement...</p>
				</div>
			</div>
		);
	}

	return <RouterProvider router={router} context={{ auth }} />;
}

// Render the app
const rootElement = document.getElementById("app");
if (rootElement && !rootElement.innerHTML) {
	const root = ReactDOM.createRoot(rootElement);
	root.render(
		<StrictMode>
			<AuthProvider>
				<InnerApp />
			</AuthProvider>
		</StrictMode>,
	);
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
