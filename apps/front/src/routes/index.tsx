import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: () => {
    // TODO: Ajouter logique d'authentification ici
    const isAuthenticated = false; // Remplacer par vraie logique auth

    if (isAuthenticated) {
      return <Navigate to="/dashboard" replace />;
    } else {
      return <Navigate to="/login" replace />;
    }
  },
});
