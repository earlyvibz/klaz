import { api } from "@klaz/backend/api";
import { Toaster } from "@klaz/ui";
import "./styles.css";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { createTuyau } from "@tuyau/client";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import reportWebVitals from "./reportWebVitals";
// Import the generated route tree
import { routeTree } from "./routeTree.gen";

export const tuyau = createTuyau({
	api,
	baseUrl: import.meta.env.VITE_API_URL || "http://localhost:3333",
	credentials: "include",
});

// Create the router instance
const router = createRouter({
	routeTree,
	context: {},
	defaultPreload: "intent",
	scrollRestoration: true,
	defaultStructuralSharing: true,
	defaultPreloadStaleTime: 0,
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

function App() {
	return <RouterProvider router={router} />;
}

const rootElement = document.getElementById("app");
if (rootElement && !rootElement.innerHTML) {
	const root = ReactDOM.createRoot(rootElement);
	root.render(
		<StrictMode>
			<Toaster />
			<App />
		</StrictMode>,
	);
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
